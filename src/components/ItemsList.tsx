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
import { pluggyApi, type PluggyItemRecord } from '../services/pluggyApi';

interface ItemsListProps {
  onItemSelect?: (item: PluggyItemRecord) => void;
  refreshTrigger?: number;
  userId?: string;
}

const getStatusColor = (status?: string) => {
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
    case 'CREATED':
      return 'cyan';
    default:
      return 'gray';
  }
};

export const ItemsList = ({ onItemSelect, refreshTrigger, userId }: ItemsListProps) => {
  const [items, setItems] = useState<PluggyItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch items from backend API (which queries Supabase)
        const data = await pluggyApi.getItems(userId);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [refreshTrigger, userId]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" colorPalette="blue" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Card.Root>
        <Card.Body>
          <Text color="red.500">{error}</Text>
          <Button mt={4} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card.Body>
      </Card.Root>
    );
  }

  if (items.length === 0) {
    return (
      <Card.Root>
        <Card.Body p={8}>
          <Text textAlign="center" color="gray.500">
            No connected accounts yet. Click "Connect Bank Account" to get started.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Stack gap={4}>
      {items.map((item) => (
        <Card.Root
          key={item.item_id}
          cursor="pointer"
          onClick={() => onItemSelect?.(item)}
          _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <Card.Body>
            <Flex align="center" gap={4}>
              {item.connector_image_url && (
                <Image
                  src={item.connector_image_url}
                  alt={item.connector_name || 'Bank'}
                  boxSize="48px"
                  borderRadius="md"
                  objectFit="contain"
                />
              )}
              
              <Box flex={1}>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="lg" fontWeight="semibold">
                    {item.connector_name || 'Unknown Bank'}
                  </Text>
                  <Badge colorPalette={getStatusColor(item.status)}>
                    {item.status || 'UNKNOWN'}
                  </Badge>
                </Flex>
                
                <Text fontSize="sm" color="gray.600">
                  Connected: {new Date(item.created_at || '').toLocaleDateString()}
                </Text>
                
                {item.last_updated_at && (
                  <Text fontSize="sm" color="gray.500">
                    Last updated: {new Date(item.last_updated_at).toLocaleDateString()}
                  </Text>
                )}
              </Box>

              <Button variant="ghost" colorPalette="blue">
                View Accounts →
              </Button>
            </Flex>
          </Card.Body>
        </Card.Root>
      ))}
    </Stack>
  );
};