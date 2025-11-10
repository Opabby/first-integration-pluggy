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
import type { InvestmentRecord } from "../types/pluggy";

interface InvestmentsListProps {
  itemId: string;
  onInvestmentSelect?: (investment: InvestmentRecord) => void;
}

const formatCurrency = (amount: number, currency: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
};

const getInvestmentTypeLabel = (type?: string) => {
  if (!type) return "Investment";
  return type.replace(/_/g, " ");
};

const formatInvestmentSubtype = (subtype?: string) => {
  if (!subtype) return "";
  return subtype.replace(/_/g, " ");
};

export const InvestmentsList = ({
  itemId,
  onInvestmentSelect,
}: InvestmentsListProps) => {
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await pluggyApi.getInvestmentsFromDb(itemId);
        console.log('Investments API response:', data, 'Type:', typeof data, 'Is Array:', Array.isArray(data));
        
        let investmentsArray: InvestmentRecord[] = [];
        
        // Ensure data is always an array
        if (Array.isArray(data)) {
          investmentsArray = data;
        } else if (data && Array.isArray(data.investments)) {
          investmentsArray = data.investments;
        } else if (data && Array.isArray(data.results)) {
          investmentsArray = data.results;
        } else if (data && typeof data === 'object' && data !== null) {
          investmentsArray = [data];
        } else {
          console.warn('Unexpected investments data format:', data);
          setInvestments([]);
          return;
        }
        
        // Normalize investment data: map 'id' to 'investment_id' if needed
        const normalizedInvestments = investmentsArray.map((investment: any) => {
          // If investment has 'id' but not 'investment_id', create investment_id from id
          if (investment.id && !investment.investment_id) {
            return {
              ...investment,
              investment_id: investment.id
            };
          }
          return investment;
        });
        
        console.log('Normalized investments:', normalizedInvestments);
        setInvestments(normalizedInvestments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load investments"
        );
        setInvestments([]); // Reset to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchInvestments();
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

  // Ensure investments is always an array before rendering
  if (!Array.isArray(investments)) {
    return (
      <Card.Root p={4}>
        <Text color="red.500">
          Error: Invalid investments data format. Expected an array.
        </Text>
      </Card.Root>
    );
  }

  if (investments.length === 0) {
    return (
      <Card.Root p={8}>
        <Text textAlign="center" color="gray.500">
          No investments found for this item.
        </Text>
      </Card.Root>
    );
  }

  return (
    <Stack gap={4}>
      {investments.map((investment) => (
        <Card.Root key={investment.investment_id} p={4}>
          <Flex justify="space-between" align="start">
            <Box>
              <Flex gap={2} align="center" mb={2}>
                <Text fontWeight="bold" fontSize="lg">
                  {investment.name}
                </Text>
                {investment.type && (
                  <Badge colorScheme="purple">
                    {investment.subtype 
                      ? formatInvestmentSubtype(investment.subtype)
                      : getInvestmentTypeLabel(investment.type)}
                  </Badge>
                )}
              </Flex>

              {investment.code && (
                <Text fontSize="sm" color="gray.600">
                  Code: {investment.code}
                </Text>
              )}

              {investment.number && (
                <Text fontSize="sm" color="gray.600">
                  Number: {investment.number}
                </Text>
              )}

              {investment.owner && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Owner: {investment.owner}
                </Text>
              )}

              {investment.quantity !== undefined && investment.quantity !== null && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Quantity: {investment.quantity}
                </Text>
              )}
            </Box>

            <Box textAlign="right">
              {investment.balance !== undefined && investment.balance !== null && (
                <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                  {formatCurrency(
                    investment.balance,
                    investment.currency_code || "BRL"
                  )}
                </Text>
              )}

              {investment.value !== undefined && investment.value !== null && (
                <Text fontSize="lg" fontWeight="semibold" color="green.600">
                  Value: {formatCurrency(
                    investment.value,
                    investment.currency_code || "BRL"
                  )}
                </Text>
              )}

              {investment.amount !== undefined && investment.amount !== null && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Amount: {formatCurrency(
                    investment.amount,
                    investment.currency_code || "BRL"
                  )}
                </Text>
              )}
            </Box>
          </Flex>

          {onInvestmentSelect && (
            <Button
              size="sm"
              variant="outline"
              mt={4}
              onClick={() => onInvestmentSelect(investment)}
            >
              View Transactions
            </Button>
          )}
        </Card.Root>
      ))}
    </Stack>
  );
};

