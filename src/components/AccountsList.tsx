import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Text,
  Flex,
  Badge,
  Stack,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { pluggyApi } from "../services/pluggyApi";
import type { Account } from "pluggy-js";

interface AccountsListProps {
  itemId: string;
  onAccountSelect?: (account: Account) => void;
}

const formatCurrency = (amount: number, currency: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
};

export const AccountsList = ({
  itemId,
  onAccountSelect,
}: AccountsListProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await pluggyApi.getAccounts(itemId);
        setAccounts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load accounts"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [itemId]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Card.Root p={4}>
        <Text color="red.500">{error}</Text>
      </Card.Root>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card.Root p={8}>
        <Text textAlign="center" color="gray.500">
          No accounts found for this item.
        </Text>
      </Card.Root>
    );
  }

  return (
    <Stack gap={4}>
      {accounts.map((account) => (
        <Card.Root key={account.id} p={4}>
          <Flex justify="space-between" align="start">
            <Box>
              <Flex gap={2} align="center" mb={2}>
                <Text fontWeight="bold" fontSize="lg">
                  {account.name}
                </Text>
                <Badge
                  colorScheme={account.type === "CREDIT" ? "purple" : "blue"}
                >
                  {account.subtype.replace("_", " ")}
                </Badge>
              </Flex>

              <Text fontSize="sm" color="gray.600">
                Account: {account.number}
              </Text>
            </Box>

            <Box textAlign="right">
              <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                {formatCurrency(account.balance, account.currencyCode)}
              </Text>

              {account.creditData && (
                <Text fontSize="sm" color="gray.600">
                  Limit:{" "}
                  {formatCurrency(
                    account.creditData.creditLimit ?? 0,
                    account.currencyCode
                  )}
                </Text>
              )}
            </Box>
          </Flex>

          <Button
            size="sm"
            variant="outline"
            mt={4}
            onClick={() => onAccountSelect?.(account)}
          >
            View Transactions
          </Button>
        </Card.Root>
      ))}
    </Stack>
  );
};
