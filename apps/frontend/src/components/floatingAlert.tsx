import { Alert } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

type FloatingAlertProps = {
  message?: string | null;
  status?: 'info' | 'error';
  timeout?: number;
};

export function FloatingAlert({
  message,
  status,
  timeout,
}: FloatingAlertProps) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);

    if (!timeout) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, [message, timeout]);

  if (!message || !visible) return null;

  return (
    <Alert.Root
      color={status === "info" ? "neutral.800" : "red"}
      status="info"
      bg="white"
      variant="subtle"
      boxShadow="lg"
      position="fixed"
      zIndex="toast"
      top="12px"
      right="12px"
      w="fit-content"
      maxW="400px"
    >
      <Alert.Indicator />
      <Alert.Title textStyle="p2" fontWeight={500}>
        {message}
      </Alert.Title>
    </Alert.Root>
  );
}