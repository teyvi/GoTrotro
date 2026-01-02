import { useEffect, useState } from "react";

/**
 * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number = 500) => {
  const [debounced, setDebounced] = useState<T>(value);
  
  useEffect(() => {
    const timeoutHandler = setTimeout(() => {
      setDebounced(value);
    }, delay);
    
    return () => clearTimeout(timeoutHandler);
  }, [value, delay]);
  
  return debounced;
};