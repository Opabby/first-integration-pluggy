import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Button,
  Tabs,
} from '@chakra-ui/react';
import { ConnectButton } from './components/ConnectButton';
import { ItemsList } from './components/ItemsList';
import { AccountsList } from './components/AccountsList';
import { IdentityDisplay } from './components/IdentityDisplay';
import { TransactionsList } from './components/TransactionsList';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { AccountRecord } from './types/pluggy';
import type { PluggyItemRecord } from './services/pluggyApi';

function App() {
  const [selectedItem, setSelectedItem] = useState<PluggyItemRecord | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    console.log('New item connected');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleError = (message: string) => {
    console.error('Connection error:', message);
  };

  const handleItemSelect = (item: PluggyItemRecord) => {
    console.log('Selecting item:', item);
    try {
      if (item && item.item_id) {
        setSelectedItem(item);
        setSelectedAccount(null); // Reset account when selecting new item
      } else {
        console.error('Invalid item selected:', item);
      }
    } catch (error) {
      console.error('Error in handleItemSelect:', error);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <Stack gap={8}>
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

          {!selectedItem && !selectedAccount && (
            <Box>
              <Heading size="lg" mb={4}>
                Connected Accounts
              </Heading>
              <ItemsList
                onItemSelect={handleItemSelect}
                refreshTrigger={refreshTrigger}
              />
            </Box>
          )}

          {selectedItem && !selectedAccount && (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">
                  {selectedItem.connector_name || 'Item Details'}
                </Heading>
                <Button onClick={() => {
                  setSelectedItem(null);
                  setSelectedAccount(null);
                }} variant="ghost">
                  Back to Items
                </Button>
              </Flex>

              {selectedItem.item_id ? (
                <ErrorBoundary>
                  <Tabs.Root defaultValue="accounts">
                    <Tabs.List>
                      <Tabs.Trigger value="accounts">Accounts</Tabs.Trigger>
                      <Tabs.Trigger value="identity">Identity</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="accounts" pt={4}>
                      <ErrorBoundary>
                        <AccountsList
                          itemId={selectedItem.item_id}
                          onAccountSelect={(account) => {
                            try {
                              console.log('Account selected:', account);
                              // Normalize account: use account_id if available, otherwise use id
                              const normalizedAccount = {
                                ...account,
                                account_id: account.account_id || (account as any).id
                              };
                              console.log('Normalized account:', normalizedAccount);
                              console.log('Account ID:', normalizedAccount.account_id);
                              if (normalizedAccount && normalizedAccount.account_id) {
                                setSelectedAccount(normalizedAccount as AccountRecord);
                              } else {
                                console.error('Invalid account selected - missing account_id:', account);
                              }
                            } catch (error) {
                              console.error('Error selecting account:', error);
                            }
                          }}
                        />
                      </ErrorBoundary>
                    </Tabs.Content>

                    <Tabs.Content value="identity" pt={4}>
                      <ErrorBoundary>
                        <IdentityDisplay itemId={selectedItem.item_id} />
                      </ErrorBoundary>
                    </Tabs.Content>
                  </Tabs.Root>
                </ErrorBoundary>
              ) : (
                <Box p={4} bg="red.50" borderRadius="md">
                  <Text color="red.500" fontWeight="bold">Error: Item ID is missing</Text>
                  <Text color="red.400" fontSize="sm" mt={2}>
                    Selected item: {JSON.stringify(selectedItem, null, 2)}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {selectedAccount && (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">
                  {selectedAccount.name || 'Account'} - Transactions
                </Heading>
                <Button onClick={() => {
                  console.log('Going back to accounts');
                  setSelectedAccount(null);
                }} variant="ghost">
                  Back to Accounts
                </Button>
              </Flex>
              {selectedAccount.account_id ? (
                <ErrorBoundary>
                  <TransactionsList accountId={selectedAccount.account_id} />
                </ErrorBoundary>
              ) : (
                <Box p={4} bg="red.50" borderRadius="md">
                  <Text color="red.500" fontWeight="bold">Error: Account ID is missing</Text>
                  <Text color="red.400" fontSize="sm" mt={2}>
                    Selected account: {JSON.stringify(selectedAccount, null, 2)}
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;