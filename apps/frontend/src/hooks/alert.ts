import { useCallback, useRef, useState } from 'react';

export interface AlertState {
  message: string;
  id: number;
}

export function useAlert(): [AlertState | null, (message: string) => void] {
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const idRef = useRef<number>(0);

  const setAlertMessage = useCallback((message: string) => {
    setAlertState({ message, id: idRef.current++ });
  }, []);

  return [alertState, setAlertMessage];
}
