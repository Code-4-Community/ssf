import { useCallback, useRef, useState } from 'react';
import { AlertStatus, AlertType } from '../types/types';

export interface AlertState {
  message: string;
  status: AlertStatus;
  id: number;
  type: AlertType | null;
}

export function useAlert(): [
  AlertState | null,
  (message: string, status: AlertStatus, type?: AlertType | null) => void,
] {
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const idRef = useRef<number>(0);

  const setAlertMessage = useCallback(
    (message: string, status: AlertStatus, type: AlertType | null = null) => {
      setAlertState({ message, status, type, id: idRef.current++ });
    },
    [],
  );

  return [alertState, setAlertMessage];
}
