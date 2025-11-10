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
import type { AccountRecord } from "../types/pluggy";

interface AccountsListProps {
  itemId: string;
  onAccountSelect?: (account: AccountRecord) => void;
}

const formatCurrency = (amount: number, currency: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
};

const getAccountTypeLabel = (type: string) => {
  switch (type) {
    case "BANK":
      return "Bank Account";
    case "CREDIT":
      return "Credit Card";
    case "PAYMENT_ACCOUNT":
      return "Payment Account";
    default:
      return type;
  }
};

const formatAccountSubtype = (subtype?: string) => {
  if (!subtype) return "";
  return subtype.replace(/_/g, " ");
};

export const AccountsList = ({
  itemId,
  onAccountSelect,
}: AccountsListProps) => {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await pluggyApi.getAccountsFromDb(itemId);
        console.log('Accounts API response:', data, 'Type:', typeof data, 'Is Array:', Array.isArray(data));
        
        let accountsArray: AccountRecord[] = [];
        
        // Ensure data is always an array
        if (Array.isArray(data)) {
          accountsArray = data;
        } else if (data && Array.isArray(data.accounts)) {
          // Handle case where API returns { accounts: [...] }
          accountsArray = data.accounts;
        } else if (data && Array.isArray(data.results)) {
          // Handle case where API returns { results: [...] }
          accountsArray = data.results;
        } else if (data && typeof data === 'object' && data !== null) {
          // Handle case where API returns a single account object
          accountsArray = [data];
        } else {
          console.warn('Unexpected accounts data format:', data);
          setAccounts([]);
          return;
        }
        
        // Normalize account data: map 'id' to 'account_id' if needed
        const normalizedAccounts = accountsArray.map((account: any) => {
          // If account has 'id' but not 'account_id', create account_id from id
          if (account.id && !account.account_id) {
            return {
              ...account,
              account_id: account.id
            };
          }
          return account;
        });
        
        console.log('Normalized accounts:', normalizedAccounts);
        setAccounts(normalizedAccounts);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load accounts"
        );
        setAccounts([]); // Reset to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchAccounts();
    }
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

  // Ensure accounts is always an array before rendering
  if (!Array.isArray(accounts)) {
    return (
      <Card.Root p={4}>
        <Text color="red.500">
          Error: Invalid accounts data format. Expected an array.
        </Text>
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
        <Card.Root key={account.account_id} p={4}>
          <Flex justify="space-between" align="start">
            <Box>
              <Flex gap={2} align="center" mb={2}>
                <Text fontWeight="bold" fontSize="lg">
                  {account.name}
                </Text>
                <Badge
                  colorScheme={account.type === "CREDIT" ? "purple" : "blue"}
                >
                  {account.subtype 
                    ? formatAccountSubtype(account.subtype)
                    : getAccountTypeLabel(account.type)}
                </Badge>
              </Flex>

              {account.marketing_name && (
                <Text fontSize="sm" color="gray.500" mb={1}>
                  {account.marketing_name}
                </Text>
              )}

              {account.number && (
                <Text fontSize="sm" color="gray.600">
                  Account: {account.number}
                </Text>
              )}

              {account.owner && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Owner: {account.owner}
                </Text>
              )}
            </Box>

            <Box textAlign="right">
              <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                {formatCurrency(
                  account.balance ?? 0,
                  account.currency_code || "BRL"
                )}
              </Text>

              {account.credit_data && account.credit_data.creditLimit && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Limit:{" "}
                  {formatCurrency(
                    account.credit_data.creditLimit,
                    account.currency_code || "BRL"
                  )}
                </Text>
              )}

              {account.credit_data?.availableCreditLimit !== undefined && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Available:{" "}
                  {formatCurrency(
                    account.credit_data.availableCreditLimit,
                    account.currency_code || "BRL"
                  )}
                </Text>
              )}
            </Box>
          </Flex>

          {onAccountSelect && (
            <Button
              size="sm"
              variant="outline"
              mt={4}
              onClick={() => onAccountSelect(account)}
            >
              View Transactions
            </Button>
          )}
        </Card.Root>
      ))}
    </Stack>
  );
};