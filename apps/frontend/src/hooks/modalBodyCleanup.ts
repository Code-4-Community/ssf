import { useEffect } from 'react';

export const useModalBodyCleanup = () => {
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, []);
};
