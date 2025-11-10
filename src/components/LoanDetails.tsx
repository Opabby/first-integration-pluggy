import {
  Box,
  Card,
  Text,
  Flex,
  Stack,
  Badge,
} from "@chakra-ui/react";
import type { LoanRecord } from "../types/pluggy";

interface LoanDetailsProps {
  loan: LoanRecord;
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

const formatPercentage = (value?: number) => {
  if (value === undefined || value === null) return "N/A";
  return `${value.toFixed(2)}%`;
};

const getLoanTypeLabel = (type?: string) => {
  if (!type) return "Loan";
  return type.replace(/_/g, " ");
};

const formatLoanSubtype = (subtype?: string) => {
  if (!subtype) return "";
  return subtype.replace(/_/g, " ");
};

export const LoanDetails = ({ loan }: LoanDetailsProps) => {
  return (
    <Card.Root p={6}>
      <Stack gap={6}>
        <Box>
          <Flex gap={2} align="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="brand.600">
              {loan.product_name}
            </Text>
            {loan.type && (
              <Badge colorScheme="orange" size="lg">
                {loan.subtype 
                  ? formatLoanSubtype(loan.subtype)
                  : getLoanTypeLabel(loan.type)}
              </Badge>
            )}
          </Flex>

          <Stack gap={3}>
            {loan.type && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Tipo:
                </Text>
                <Text>{loan.subtype ? formatLoanSubtype(loan.subtype) : getLoanTypeLabel(loan.type)}</Text>
              </Flex>
            )}

            {loan.product_name && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Nome:
                </Text>
                <Text>{loan.product_name}</Text>
              </Flex>
            )}

            {loan.contract_number && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Número do contrato:
                </Text>
                <Text>{loan.contract_number}</Text>
              </Flex>
            )}

            {(loan.date || loan.created_at) && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Data:
                </Text>
                <Text>{formatDate(loan.date || loan.created_at)}</Text>
              </Flex>
            )}

            {loan.currency_code && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Código da moeda:
                </Text>
                <Text>{loan.currency_code}</Text>
              </Flex>
            )}

            {(loan.contracted_amount !== undefined && loan.contracted_amount !== null) && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Valor contratado:
                </Text>
                <Text fontWeight="bold">
                  {formatCurrency(loan.contracted_amount, loan.currency_code || "BRL")}
                </Text>
              </Flex>
            )}

            {(loan.current_debt_amount !== undefined && loan.current_debt_amount !== null) && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Valor atual da dívida:
                </Text>
                <Text fontWeight="bold">
                  {formatCurrency(loan.current_debt_amount, loan.currency_code || "BRL")}
                </Text>
              </Flex>
            )}

            {(loan.outstanding_balance !== undefined && loan.outstanding_balance !== null) && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Saldo devedor:
                </Text>
                <Text fontWeight="bold">
                  {formatCurrency(loan.outstanding_balance, loan.currency_code || "BRL")}
                </Text>
              </Flex>
            )}

            {(loan.balance !== undefined && loan.balance !== null) && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Saldo:
                </Text>
                <Text fontWeight="bold">
                  {formatCurrency(loan.balance, loan.currency_code || "BRL")}
                </Text>
              </Flex>
            )}

            {loan.installments_to_pay && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Parcelas a pagar:
                </Text>
                <Text>{loan.installments_to_pay}</Text>
              </Flex>
            )}

            {loan.installment_frequency && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Periodicidade das parcelas:
                </Text>
                <Text>{loan.installment_frequency}</Text>
              </Flex>
            )}

            {loan.principal_debt !== undefined && loan.principal_debt !== null && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Dívida principal:
                </Text>
                <Text>{formatCurrency(loan.principal_debt, loan.currency_code || "BRL")}</Text>
              </Flex>
            )}

            {loan.interest_rate !== undefined && loan.interest_rate !== null && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Taxa de juros:
                </Text>
                <Text>{formatPercentage(loan.interest_rate)}</Text>
              </Flex>
            )}

            {loan.cet !== undefined && loan.cet !== null && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Custo Efetivo Total (CET) (anual):
                </Text>
                <Text fontWeight="bold">{formatPercentage(loan.cet)}</Text>
              </Flex>
            )}

            {loan.minimum_payment !== undefined && loan.minimum_payment !== null && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Pagamento mínimo:
                </Text>
                <Text>{formatCurrency(loan.minimum_payment, loan.currency_code || "BRL")}</Text>
              </Flex>
            )}

            {loan.due_date && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Data de vencimento:
                </Text>
                <Text>{formatDate(loan.due_date)}</Text>
              </Flex>
            )}

            {loan.owner && (
              <Flex justify="space-between">
                <Text fontWeight="medium" color="gray.600">
                  Proprietário:
                </Text>
                <Text>{loan.owner}</Text>
              </Flex>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card.Root>
  );
};

