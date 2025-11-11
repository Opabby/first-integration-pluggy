import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Text,
  Flex,
  Badge,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { pluggyApi } from "../services/pluggyApi";
import type { CreditCardBillRecord } from "../types/pluggy";

interface CreditCardBillsListProps {
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

export const CreditCardBillsList = ({ accountId }: CreditCardBillsListProps) => {
  const [bills, setBills] = useState<CreditCardBillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔵 CreditCardBillsList component rendered with accountId:', accountId, typeof accountId);

  useEffect(() => {
    console.log('🟢 CreditCardBillsList useEffect triggered, accountId:', accountId);
    
    if (!accountId) {
      console.warn('⚠️ No accountId provided, skipping fetch');
      setIsLoading(false);
      setBills([]);
      return;
    }
    
    const fetchBills = async () => {
      console.log('🟡 fetchBills called for accountId:', accountId);
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔴 Making API call to getCreditCardBillsFromDb with:', { accountId });
        const data = await pluggyApi.getCreditCardBillsFromDb(accountId);
        console.log('✅ Bills API response:', data, 'Type:', typeof data, 'Is Array:', Array.isArray(data));
        
        // Ensure data is always an array
        if (Array.isArray(data)) {
          console.log('✅ Setting bills array with', data.length, 'items');
          setBills(data);
        } else if (data && Array.isArray(data.bills)) {
          // Handle case where API returns { bills: [...] }
          console.log('✅ Setting bills from data.bills with', data.bills.length, 'items');
          setBills(data.bills);
        } else if (data && Array.isArray(data.results)) {
          // Handle case where API returns { results: [...] }
          console.log('✅ Setting bills from data.results with', data.results.length, 'items');
          setBills(data.results);
        } else if (data && typeof data === 'object' && data !== null) {
          // Handle case where API returns a single bill object
          if (data.bill_id) {
            console.log('✅ Setting single bill');
            setBills([data]);
          } else {
            console.warn('⚠️ Unexpected bills data format - object without bill_id:', data);
            setBills([]);
          }
        } else {
          console.warn('⚠️ Unexpected bills data format:', data);
          setBills([]);
        }
      } catch (err) {
        console.error('❌ Error fetching bills:', err);
        setError(
          err instanceof Error ? err.message : "Failed to load credit card bills"
        );
        setBills([]); // Reset to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    // Always call fetchBills if accountId exists
    fetchBills();
  }, [accountId]);

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

  // Ensure bills is always an array before rendering
  if (!Array.isArray(bills)) {
    return (
      <Card.Root p={4}>
        <Text color="red.500">
          Error: Invalid bills data format. Expected an array.
        </Text>
      </Card.Root>
    );
  }

  if (bills.length === 0) {
    return (
      <Card.Root p={8}>
        <Text textAlign="center" color="gray.500">
          No credit card bills found for this account.
        </Text>
      </Card.Root>
    );
  }

  // Sort bills by due_date in descending order (most recent first)
  const sortedBills = [...bills].sort((a, b) => {
    const dateA = new Date(a.due_date).getTime();
    const dateB = new Date(b.due_date).getTime();
    return dateB - dateA;
  });

  return (
    <Box>
      <Stack gap={4}>
        {sortedBills.map((bill) => {
          const dueDate = new Date(bill.due_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isOverdue = dueDate < today;
          const isDueSoon = dueDate >= today && dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

          return (
            <Card.Root key={bill.bill_id} p={4}>
              <Flex justify="space-between" align="start">
                <Box flex={1}>
                  <Flex gap={2} align="center" mb={2} wrap="wrap">
                    <Text fontWeight="bold" fontSize="lg">
                      Bill 
                    </Text>
                    {bill.status && (
                      <Badge
                        colorScheme={
                          bill.status.toLowerCase() === 'paid' ? 'green' :
                          isOverdue ? 'red' :
                          isDueSoon ? 'orange' : 'blue'
                        }
                        size="sm"
                      >
                        {bill.status.toUpperCase()}
                      </Badge>
                    )}
                    {!bill.status && isOverdue && (
                      <Badge colorScheme="red" size="sm">
                        OVERDUE
                      </Badge>
                    )}
                    {!bill.status && isDueSoon && (
                      <Badge colorScheme="orange" size="sm">
                        DUE SOON
                      </Badge>
                    )}
                  </Flex>

                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Due Date: {formatDate(bill.due_date)}
                  </Text>

                  {bill.minimum_payment !== undefined && bill.minimum_payment !== null && (
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Minimum Payment: {formatCurrency(
                        bill.minimum_payment,
                        bill.currency_code || "BRL"
                      )}
                    </Text>
                  )}

                  {bill.payment_date && (
                    <Text fontSize="sm" color="green.600" mb={1}>
                      Payment Date: {formatDate(bill.payment_date)}
                    </Text>
                  )}

                  {bill.paid_amount !== undefined && bill.paid_amount !== null && (
                    <Text fontSize="sm" color="green.600" mb={1}>
                      Paid Amount: {formatCurrency(
                        bill.paid_amount,
                        bill.currency_code || "BRL"
                      )}
                    </Text>
                  )}
                </Box>

                <Box textAlign="right" ml={4}>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={bill.total_amount >= 0 ? "red.600" : "green.600"}
                  >
                    {formatCurrency(
                      Math.abs(bill.total_amount),
                      bill.currency_code || "BRL"
                    )}
                  </Text>

                  {bill.paid_amount !== undefined && 
                   bill.paid_amount !== null && 
                   bill.total_amount > 0 && (
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Remaining: {formatCurrency(
                        bill.total_amount - bill.paid_amount,
                        bill.currency_code || "BRL"
                      )}
                    </Text>
                  )}
                </Box>
              </Flex>
            </Card.Root>
          );
        })}
      </Stack>
    </Box>
  );
};

