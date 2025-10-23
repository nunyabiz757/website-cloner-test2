/**
 * useSecureStorage Hook
 * React hook for secure localStorage with encryption
 */

import { useState, useEffect, useCallback } from 'react';
import { secureLocalStorage, StorageOptions } from '../services/SecureStorageService';

export function useSecureStorage<T = any>(
  key: string,
  initialValue?: T,
  options?: StorageOptions
): [T | null, (value: T | null) => void, () => void] {
  // Get initial value from storage or use provided initial value
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      const item = secureLocalStorage.getItem<T>(key);
      return item !== null ? item : initialValue || null;
    } catch (error) {
      console.error(`Error loading ${key} from secure storage:`, error);
      return initialValue || null;
    }
  });

  // Set value in storage
  const setValue = useCallback(
    (value: T | null) => {
      try {
        if (value === null) {
          secureLocalStorage.removeItem(key);
        } else {
          secureLocalStorage.setItem(key, value, options);
        }
        setStoredValue(value);
      } catch (error) {
        console.error(`Error saving ${key} to secure storage:`, error);
      }
    },
    [key, options]
  );

  // Remove value from storage
  const removeValue = useCallback(() => {
    try {
      secureLocalStorage.removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.error(`Error removing ${key} from secure storage:`, error);
    }
  }, [key]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null;
          setStoredValue(newValue);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
