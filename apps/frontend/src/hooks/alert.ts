import { useCallback, useRef, useState } from 'react';
import { AlertStatus } from '../types/types';

export interface AlertState {
  message: string;
  status: AlertStatus;
  id: number;
}

export function useAlert(): [
  AlertState | null,
  (message: string, status: AlertStatus) => void,
] {
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const idRef = useRef<number>(0);

  const setAlertMessage = useCallback(
    (message: string, status: AlertStatus) => {
      setAlertState({ message, status, id: idRef.current++ });
    },
    [],
  );

  return [alertState, setAlertMessage];
}
