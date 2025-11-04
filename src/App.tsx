import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Button,
} from '@chakra-ui/react';
import { ConnectButton } from './components/ConnectButton';
import { ItemsList } from './components/ItemsList';
import { AccountsList } from './components/AccountsList';
import type { Item, Account } from './types/pluggy';

function App() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = (item: Item) => {
    console.log('New item connected:', item);
    // Trigger refresh of items list
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleError = (message: string) => {
    console.error('Connection error:', message);
    // You could show a toast notification here
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <Stack gap={8}>
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="2xl" mb={2}>
                Pluggy Financial Dashboard
              </Heading>
              <Text color="gray.600">
                Connect your bank accounts and view your financial data
              </Text>
            </Box>
            
            <ConnectButton
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </Flex>

          {/* Main Content */}
          {!selectedItem && !selectedAccount && (
            <Box>
              <Heading size="lg" mb={4}>
                Connected Accounts
              </Heading>
              <ItemsList
                onItemSelect={setSelectedItem}
                refreshTrigger={refreshTrigger}
              />
            </Box>
          )}

          {selectedItem && !selectedAccount && (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">
                  {selectedItem.connector.name} - Accounts
                </Heading>
                <Button onClick={() => setSelectedItem(null)} variant="ghost">
                  Back to Items
                </Button>
              </Flex>
              <AccountsList
                itemId={selectedItem.id}
                onAccountSelect={setSelectedAccount}
              />
            </Box>
          )}

          {selectedAccount && (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">
                  {selectedAccount.name} - Transactions
                </Heading>
                <Button onClick={() => setSelectedAccount(null)} variant="ghost">
                  Back to Accounts
                </Button>
              </Flex>
              <Text color="gray.600">
                Transactions component coming next...
              </Text>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;