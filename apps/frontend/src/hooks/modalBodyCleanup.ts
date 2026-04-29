import { useEffect } from 'react';

// Chakra modals sometimes leave `pointer-events: none` and `overflow: hidden`
// on <body> when they close unexpectedly (e.g. unmount during open state),
// causing the page to become unscrollable or unclickable. Use this hook in any
// component that opens a Chakra modal so those styles are always stripped on unmount.
export const useModalBodyCleanup = () => {
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    };
  }, []);
};
