import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { PluggyConnect } from 'react-pluggy-connect';
import { usePluggyConnect } from '../hooks/usePluggyConnect';
import type { Item, PluggySuccessData, PluggyErrorData } from '../types/pluggy';

interface ConnectButtonProps {
  userId?: string;
  onSuccess?: (item: Item) => void;
  onError?: (message: string) => void;
}

export const ConnectButton = ({ userId, onSuccess, onError }: ConnectButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    connectToken,
    isLoading,
    error,
    fetchConnectToken,
    handleSuccess,
    handleError,
  } = usePluggyConnect(userId);

  const handleClick = async () => {
    try {
      await fetchConnectToken();
      setIsOpen(true);
    } catch {
      onError?.(error || 'Failed to initialize connection');
    }
  };

  const onPluggySuccess = async (data: PluggySuccessData) => {
    const item = await handleSuccess(data);
    setIsOpen(false);
    onSuccess?.(item);
  };

  const onPluggyError = (data: PluggyErrorData) => {
    handleError(data);
    setIsOpen(false);
    onError?.(data.message);
  };

  const includeSandbox = import.meta.env.VITE_INCLUDE_SANDBOX === 'true';

  return (
    <>
      <Button
        colorScheme="brand"
        size="lg"
        onClick={handleClick}
        loading={isLoading}
        disabled={isLoading}
      >
        Connect Bank Account
      </Button>

      {isOpen && connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={includeSandbox}
          onSuccess={onPluggySuccess}
          onError={onPluggyError}
          onClose={() => setIsOpen(false)}
          onEvent={(event) => {
            console.log('Pluggy event:', event);
          }}
        />
      )}
    </>
  );
};