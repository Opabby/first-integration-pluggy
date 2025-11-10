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
import type { InvestmentTransactionRecord } from "../types/pluggy";

interface InvestmentTransactionsListProps {
  investmentId: string;
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

export const InvestmentTransactionsList = ({ investmentId }: InvestmentTransactionsListProps) => {
  const [transactions, setTransactions] = useState<InvestmentTransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  console.log('🔵 InvestmentTransactionsList component rendered with investmentId:', investmentId, typeof investmentId);

  useEffect(() => {
    console.log('🟢 InvestmentTransactionsList useEffect triggered, investmentId:', investmentId, 'page:', page, 'pageSize:', pageSize);
    
    if (!investmentId) {
      console.warn('⚠️ No investmentId provided, skipping fetch');
      setIsLoading(false);
      setTransactions([]);
      return;
    }
    
    const fetchTransactions = async () => {
      console.log('🟡 fetchTransactions called for investmentId:', investmentId);
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔴 Making API call to getInvestmentTransactions with:', { investmentId, page, pageSize });
        const data = await pluggyApi.getInvestmentTransactions(
          investmentId,
          page,
          pageSize
        );
        console.log('✅ Investment transactions API response:', data, 'Type:', typeof data, 'Is Array:', Array.isArray(data));
        
        // Ensure data is always an array
        if (Array.isArray(data)) {
          console.log('✅ Setting transactions array with', data.length, 'items');
          setTransactions(data);
        } else if (data && Array.isArray(data.transactions)) {
          console.log('✅ Setting transactions from data.transactions with', data.transactions.length, 'items');
          setTransactions(data.transactions);
        } else if (data && Array.isArray(data.results)) {
          console.log('✅ Setting transactions from data.results with', data.results.length, 'items');
          setTransactions(data.results);
        } else if (data && typeof data === 'object' && data !== null) {
          if (data.transaction_id) {
            console.log('✅ Setting single transaction');
            setTransactions([data]);
          } else {
            console.warn('⚠️ Unexpected transactions data format - object without transaction_id:', data);
            setTransactions([]);
          }
        } else {
          console.warn('⚠️ Unexpected transactions data format:', data);
          setTransactions([]);
        }
      } catch (err) {
        console.error('❌ Error fetching investment transactions:', err);
        setError(
          err instanceof Error ? err.message : "Failed to load investment transactions"
        );
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [investmentId, page, pageSize]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const loadPrevious = () => {
    setPage((prev) => Math.max(1, prev - 1));
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

  // Ensure transactions is always an array before rendering
  if (!Array.isArray(transactions)) {
    return (
      <Card.Root p={4}>
        <Text color="red.500">
          Error: Invalid transactions data format. Expected an array.
        </Text>
      </Card.Root>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card.Root p={8}>
        <Text textAlign="center" color="gray.500">
          No transactions found for this investment.
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
                  <Text fontWeight="semibold">
                    {transaction.description || "Investment Transaction"}
                  </Text>
                  {transaction.type && (
                    <Badge colorScheme="blue" size="sm">
                      {transaction.type}
                    </Badge>
                  )}
                </Flex>

                <Text fontSize="sm" color="gray.600">
                  {formatDate(transaction.date)}
                </Text>

                {transaction.quantity !== undefined && transaction.quantity !== null && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Quantity: {transaction.quantity}
                  </Text>
                )}
              </Box>

              <Box textAlign="right" ml={4}>
                {transaction.amount !== undefined && transaction.amount !== null && (
                  <Text fontSize="lg" fontWeight="bold" color="brand.600">
                    {formatCurrency(
                      Math.abs(transaction.amount),
                      transaction.currency_code || "BRL"
                    )}
                  </Text>
                )}

                {transaction.value !== undefined && transaction.value !== null && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Value: {formatCurrency(
                      transaction.value,
                      transaction.currency_code || "BRL"
                    )}
                  </Text>
                )}

                {transaction.fees !== undefined && transaction.fees !== null && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Fees: {formatCurrency(
                      transaction.fees,
                      transaction.currency_code || "BRL"
                    )}
                  </Text>
                )}
              </Box>
            </Flex>
          </Card.Root>
        ))}
      </Stack>

      <Flex justify="space-between" align="center" mt={4}>
        <Button 
          onClick={loadPrevious} 
          size="sm" 
          variant="outline"
          disabled={page === 1}
        >
          Previous
        </Button>

        <Text fontSize="sm" color="gray.600">
          Page {page} - Showing {transactions.length} transactions
        </Text>

        <Button onClick={loadMore} size="sm" variant="outline">
          Next
        </Button>
      </Flex>
    </Box>
  );
};

