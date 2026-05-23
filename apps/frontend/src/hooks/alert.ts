import { useCallback, useRef, useState } from 'react';

export interface AlertState {
  message: string;
  status: 'success' | 'error';
  id: number;
}

export function useAlert(): [
  AlertState | null,
  (message: string, status: 'success' | 'error') => void,
] {
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const idRef = useRef<number>(0);

  const setAlertMessage = useCallback(
    (message: string, status: 'success' | 'error') => {
      setAlertState({ message, status, id: idRef.current++ });
    },
    [],
  );

  return [alertState, setAlertMessage];
}
