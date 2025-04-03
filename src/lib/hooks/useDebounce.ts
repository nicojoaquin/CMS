import { useState, useEffect } from "react";

export function useDebounce<ValueT>(value: ValueT, delay: number): ValueT {
  const [debouncedValue, setDebouncedValue] = useState<ValueT>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
