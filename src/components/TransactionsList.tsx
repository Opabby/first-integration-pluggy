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
import type { TransactionRecord } from "../types/pluggy";

interface TransactionsListProps {
  accountId: string;
}

const formatCurrency = (amount: number, currency: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const TransactionsList = ({ accountId }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(100);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await pluggyApi.getTransactionsFromDb(
          accountId,
          limit,
          offset
        );
        setTransactions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (accountId) {
      fetchTransactions();
    }
  }, [accountId, limit, offset]);

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const loadPrevious = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

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

  if (transactions.length === 0) {
    return (
      <Card.Root p={8}>
        <Text textAlign="center" color="gray.500">
          No transactions found for this account.
        </Text>
      </Card.Root>
    );
  }

  return (
    <Box>
      <Stack gap={2}>
        {transactions.map((transaction) => (
          <Card.Root key={transaction.transaction_id} p={4}>
            <Flex justify="space-between" align="start">
              <Box flex={1}>
                <Flex gap={2} align="center" mb={1} wrap="wrap">
                  <Text fontWeight="semibold">{transaction.description}</Text>
                  <Badge
                    colorScheme={
                      transaction.type === "CREDIT" ? "green" : "red"
                    }
                    size="sm"
                  >
                    {transaction.type}
                  </Badge>
                  {transaction.status === "PENDING" && (
                    <Badge colorScheme="orange" size="sm">
                      Pending
                    </Badge>
                  )}
                </Flex>

                <Text fontSize="sm" color="gray.600">
                  {formatDate(transaction.date)}
                </Text>

                {transaction.category && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {transaction.category}
                  </Text>
                )}

                {transaction.description_raw &&
                  transaction.description_raw !== transaction.description && (
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      mt={1}
                      fontStyle="italic"
                    >
                      {transaction.description_raw}
                    </Text>
                  )}
              </Box>

              <Box textAlign="right" ml={4}>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={
                    transaction.type === "CREDIT" ? "green.600" : "red.600"
                  }
                >
                  {transaction.type === "CREDIT" ? "+" : "-"}
                  {formatCurrency(
                    Math.abs(transaction.amount),
                    transaction.currency_code || "BRL"
                  )}
                </Text>

                {transaction.balance !== undefined &&
                  transaction.balance !== null && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Balance:{" "}
                      {formatCurrency(
                        transaction.balance,
                        transaction.currency_code || "BRL"
                      )}
                    </Text>
                  )}
              </Box>
            </Flex>

            {transaction.merchant &&
              typeof transaction.merchant === "object" && (
                <Box mt={2} pt={2} borderTop="1px solid" borderColor="gray.200">
                  <Text fontSize="xs" color="gray.500">
                    Merchant:{" "}
                    {(transaction.merchant as { name?: string }).name || "N/A"}
                  </Text>
                </Box>
              )}
          </Card.Root>
        ))}
      </Stack>

      <Flex justify="space-between" align="center" mt={4}>
        <Button onClick={loadPrevious} size="sm" variant="outline">
          Previous
        </Button>

        <Text fontSize="sm" color="gray.600">
          Showing {offset + 1} - {offset + transactions.length}
        </Text>

        <Button onClick={loadMore} size="sm" variant="outline">
          Load More
        </Button>
      </Flex>
    </Box>
  );
};
