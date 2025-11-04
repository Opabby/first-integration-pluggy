import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Text,
  Flex,
  Image,
  Badge,
  Button,
  Stack,
  Spinner,
} from '@chakra-ui/react';
import { pluggyApi } from '../services/api';
import type { Item } from '../types/pluggy';

interface ItemsListProps {
  onItemSelect?: (item: Item) => void;
  refreshTrigger?: number;
}

const getStatusColor = (status: Item['status']) => {
  switch (status) {
    case 'UPDATED':
      return 'green';
    case 'UPDATING':
      return 'blue';
    case 'LOGIN_ERROR':
      return 'red';
    case 'OUTDATED':
      return 'orange';
    case 'WAITING_USER_INPUT':
      return 'yellow';
    default:
      return 'gray';
  }
};

export const ItemsList = ({ onItemSelect, refreshTrigger }: ItemsListProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await pluggyApi.getItems();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [refreshTrigger]);

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

  if (items.length === 0) {
    return (
      <Card.Root p={8}>
        <Text textAlign="center" color="gray.500">
          No connected accounts yet. Click "Connect Bank Account" to get started.
        </Text>
      </Card.Root>
    );
  }

  return (
    <Stack gap={4}>
      {items.map((item) => (
        <Card.Root key={item.id} p={4} _hover={{ shadow: 'md' }} cursor="pointer">
          <Flex gap={4} align="center">
            <Image
              src={item.connector.imageUrl}
              alt={item.connector.name}
              boxSize="48px"
              borderRadius="md"
            />
            
            <Box flex={1}>
              <Flex justify="space-between" align="start">
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    {item.connector.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    ID: {item.id}
                  </Text>
                </Box>
                
                <Badge colorScheme={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </Flex>

              <Flex gap={2} mt={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onItemSelect?.(item)}
                >
                  View Details
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Card.Root>
      ))}
    </Stack>
  );
};