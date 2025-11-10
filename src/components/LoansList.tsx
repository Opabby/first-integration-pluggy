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
import type { LoanRecord } from "../types/pluggy";

interface LoansListProps {
  itemId: string;
  onLoanSelect?: (loan: LoanRecord) => void;
}

const formatCurrency = (amount: number, currency: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getLoanTypeLabel = (type?: string) => {
  if (!type) return "Loan";
  return type.replace(/_/g, " ");
};

const formatLoanSubtype = (subtype?: string) => {
  if (!subtype) return "";
  return subtype.replace(/_/g, " ");
};

export const LoansList = ({ itemId, onLoanSelect }: LoansListProps) => {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoans = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await pluggyApi.getLoansFromDb(itemId);
        console.log('Loans API response:', data, 'Type:', typeof data, 'Is Array:', Array.isArray(data));
        
        let loansArray: LoanRecord[] = [];
        
        // Ensure data is always an array
        if (Array.isArray(data)) {
          loansArray = data;
        } else if (data && Array.isArray(data.loans)) {
          loansArray = data.loans;
        } else if (data && Array.isArray(data.results)) {
          loansArray = data.results;
        } else if (data && typeof data === 'object' && data !== null) {
          loansArray = [data];
        } else {
          console.warn('Unexpected loans data format:', data);
          setLoans([]);
          return;
        }
        
        // Normalize loan data: map 'id' to 'loan_id' if needed
        const normalizedLoans = loansArray.map((loan: any) => {
          // If loan has 'id' but not 'loan_id', create loan_id from id
          if (loan.id && !loan.loan_id) {
            return {
              ...loan,
              loan_id: loan.id
            };
          }
          return loan;
        });
        
        console.log('Normalized loans:', normalizedLoans);
        setLoans(normalizedLoans);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load loans"
        );
        setLoans([]); // Reset to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchLoans();
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

  // Ensure loans is always an array before rendering
  if (!Array.isArray(loans)) {
    return (
      <Card.Root p={4}>
        <Text color="red.500">
          Error: Invalid loans data format. Expected an array.
        </Text>
      </Card.Root>
    );
  }

  if (loans.length === 0) {
    return (
      <Card.Root p={8}>
        <Text textAlign="center" color="gray.500">
          No loans found for this item.
        </Text>
      </Card.Root>
    );
  }

  return (
    <Stack gap={4}>
      {loans.map((loan) => (
        <Card.Root key={loan.loan_id} p={4}>
          <Flex justify="space-between" align="start">
            <Box flex={1}>
              <Flex gap={2} align="center" mb={2}>
                <Text fontWeight="bold" fontSize="lg">
                  {loan.product_name}
                </Text>
                {loan.type && (
                  <Badge colorScheme="orange">
                    {loan.subtype 
                      ? formatLoanSubtype(loan.subtype)
                      : getLoanTypeLabel(loan.type)}
                  </Badge>
                )}
              </Flex>

              {loan.contract_number && (
                <Text fontSize="sm" color="gray.600">
                  Contract: {loan.contract_number}
                </Text>
              )}

              {loan.owner && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Owner: {loan.owner}
                </Text>
              )}

              {loan.interest_rate !== undefined && loan.interest_rate !== null && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Interest Rate: {loan.interest_rate.toFixed(2)}%
                </Text>
              )}

              {loan.due_date && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Due Date: {formatDate(loan.due_date)}
                </Text>
              )}
            </Box>

            <Box textAlign="right" ml={4}>
              {loan.balance !== undefined && loan.balance !== null && (
                <Text fontSize="2xl" fontWeight="bold" color="brand.600">
                  {formatCurrency(
                    loan.balance,
                    loan.currency_code || "BRL"
                  )}
                </Text>
              )}

              {loan.outstanding_balance !== undefined && loan.outstanding_balance !== null && (
                <Text fontSize="lg" fontWeight="semibold" color="orange.600" mt={1}>
                  Outstanding: {formatCurrency(
                    loan.outstanding_balance,
                    loan.currency_code || "BRL"
                  )}
                </Text>
              )}

              {loan.principal_debt !== undefined && loan.principal_debt !== null && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Principal: {formatCurrency(
                    loan.principal_debt,
                    loan.currency_code || "BRL"
                  )}
                </Text>
              )}

              {loan.minimum_payment !== undefined && loan.minimum_payment !== null && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Min Payment: {formatCurrency(
                    loan.minimum_payment,
                    loan.currency_code || "BRL"
                  )}
                </Text>
              )}
            </Box>
          </Flex>

          {onLoanSelect && (
            <Button
              size="sm"
              variant="outline"
              mt={4}
              onClick={() => onLoanSelect(loan)}
            >
              View Details
            </Button>
          )}
        </Card.Root>
      ))}
    </Stack>
  );
};

