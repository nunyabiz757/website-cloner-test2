/**
 * Secure Storage Service
 * Provides encrypted localStorage/sessionStorage with auto-expiry
 */

import CryptoJS from 'crypto-js';

export interface StorageOptions {
  expiresIn?: number;  // Expiry time in milliseconds
  encrypt?: boolean;   // Whether to encrypt the value
}

interface StorageEntry {
  value: any;
  expiresAt?: number;
  encrypted: boolean;
}

export class SecureStorageService {
  private encryptionKey: string;
  private storageType: Storage;

  constructor(storageType: 'local' | 'session' = 'local', encryptionKey?: string) {
    this.storageType = storageType === 'local' ? localStorage : sessionStorage;
    this.encryptionKey = encryptionKey || this.getOrCreateKey();
  }

  /**
   * Get or create encryption key
   */
  private getOrCreateKey(): string {
    const keyName = 'wcp_storage_key';
    let key = localStorage.getItem(keyName);

    if (!key) {
      // Generate random key
      key = CryptoJS.lib.WordArray.random(32).toString();
      localStorage.setItem(keyName, key);
    }

    return key;
  }

  /**
   * Encrypt data
   */
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  /**
   * Decrypt data
   */
  private decrypt(encrypted: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: any, options: StorageOptions = {}): void {
    try {
      const entry: StorageEntry = {
        value,
        encrypted: options.encrypt !== false, // Encrypt by default
      };

      // Set expiry if provided
      if (options.expiresIn) {
        entry.expiresAt = Date.now() + options.expiresIn;
      }

      // Serialize entry
      let serialized = JSON.stringify(entry);

      // Encrypt if needed
      if (entry.encrypted) {
        serialized = this.encrypt(serialized);
      }

      // Store
      this.storageType.setItem(key, serialized);
    } catch (error) {
      console.error('Error setting secure storage item:', error);
      throw new Error('Failed to store data');
    }
  }

  /**
   * Get item from storage
   */
  getItem<T = any>(key: string): T | null {
    try {
      const stored = this.storageType.getItem(key);
      if (!stored) return null;

      // Try to decrypt (if encrypted)
      let entry: StorageEntry;
      try {
        const decrypted = this.decrypt(stored);
        entry = JSON.parse(decrypted);
      } catch {
        // Not encrypted or invalid
        try {
          entry = JSON.parse(stored);
        } catch {
          // Invalid format
          this.removeItem(key);
          return null;
        }
      }

      // Check expiry
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.removeItem(key);
        return null;
      }

      return entry.value as T;
    } catch (error) {
      console.error('Error getting secure storage item:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    this.storageType.removeItem(key);
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.storageType.clear();
  }

  /**
   * Check if item exists and is not expired
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Object.keys(this.storageType);
  }

  /**
   * Clean up expired items
   */
  cleanup(): void {
    const keys = this.keys();

    keys.forEach((key) => {
      // Try to get item (will auto-remove if expired)
      this.getItem(key);
    });
  }

  /**
   * Get item TTL (time to live) in milliseconds
   */
  getTTL(key: string): number | null {
    try {
      const stored = this.storageType.getItem(key);
      if (!stored) return null;

      let entry: StorageEntry;
      try {
        const decrypted = this.decrypt(stored);
        entry = JSON.parse(decrypted);
      } catch {
        try {
          entry = JSON.parse(stored);
        } catch {
          return null;
        }
      }

      if (!entry.expiresAt) return null;

      const ttl = entry.expiresAt - Date.now();
      return ttl > 0 ? ttl : 0;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extend item expiry
   */
  extend(key: string, additionalTime: number): boolean {
    try {
      const stored = this.storageType.getItem(key);
      if (!stored) return false;

      let entry: StorageEntry;
      try {
        const decrypted = this.decrypt(stored);
        entry = JSON.parse(decrypted);
      } catch {
        try {
          entry = JSON.parse(stored);
        } catch {
          return false;
        }
      }

      if (!entry.expiresAt) return false;

      // Extend expiry
      entry.expiresAt += additionalTime;

      // Re-serialize and store
      let serialized = JSON.stringify(entry);
      if (entry.encrypted) {
        serialized = this.encrypt(serialized);
      }

      this.storageType.setItem(key, serialized);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set item with TTL refresh on access
   */
  setWithAutoRefresh(key: string, value: any, ttl: number): void {
    this.setItem(key, value, { expiresIn: ttl, encrypt: true });
  }

  /**
   * Get item and refresh TTL
   */
  getWithAutoRefresh<T = any>(key: string, ttl: number): T | null {
    const value = this.getItem<T>(key);
    if (value !== null) {
      // Refresh TTL
      this.setItem(key, value, { expiresIn: ttl, encrypt: true });
    }
    return value;
  }
}

/**
 * Pre-configured storage instances
 */

// Local storage with encryption
export const secureLocalStorage = new SecureStorageService('local');

// Session storage with encryption
export const secureSessionStorage = new SecureStorageService('session');

/**
 * Token storage helpers
 */
export const TokenStorage = {
  /**
   * Store auth token
   */
  setAuthToken(token: string, expiresIn: number = 7 * 24 * 60 * 60 * 1000): void {
    secureLocalStorage.setItem('auth_token', token, {
      expiresIn,
      encrypt: true,
    });
  },

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return secureLocalStorage.getItem<string>('auth_token');
  },

  /**
   * Remove auth token
   */
  removeAuthToken(): void {
    secureLocalStorage.removeItem('auth_token');
  },

  /**
   * Check if token exists
   */
  hasAuthToken(): boolean {
    return secureLocalStorage.hasItem('auth_token');
  },

  /**
   * Store refresh token
   */
  setRefreshToken(token: string, expiresIn: number = 30 * 24 * 60 * 60 * 1000): void {
    secureLocalStorage.setItem('refresh_token', token, {
      expiresIn,
      encrypt: true,
    });
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return secureLocalStorage.getItem<string>('refresh_token');
  },

  /**
   * Remove refresh token
   */
  removeRefreshToken(): void {
    secureLocalStorage.removeItem('refresh_token');
  },

  /**
   * Clear all tokens
   */
  clearAll(): void {
    this.removeAuthToken();
    this.removeRefreshToken();
  },
};

/**
 * User data storage helpers
 */
export const UserStorage = {
  /**
   * Store user data
   */
  setUser(user: any): void {
    secureLocalStorage.setItem('user_data', user, { encrypt: true });
  },

  /**
   * Get user data
   */
  getUser<T = any>(): T | null {
    return secureLocalStorage.getItem<T>('user_data');
  },

  /**
   * Remove user data
   */
  removeUser(): void {
    secureLocalStorage.removeItem('user_data');
  },

  /**
   * Store user preferences
   */
  setPreferences(preferences: any): void {
    secureLocalStorage.setItem('user_preferences', preferences, { encrypt: false });
  },

  /**
   * Get user preferences
   */
  getPreferences<T = any>(): T | null {
    return secureLocalStorage.getItem<T>('user_preferences');
  },
};

/**
 * Session storage helpers
 */
export const SessionStorage = {
  /**
   * Store session data
   */
  setSession(sessionId: string, data: any, expiresIn: number = 7 * 24 * 60 * 60 * 1000): void { // Changed from 30 min to 7 days
    secureSessionStorage.setItem('session_data', { sessionId, ...data }, {
      expiresIn,
      encrypt: true,
    });
  },

  /**
   * Get session data
   */
  getSession<T = any>(): T | null {
    return secureSessionStorage.getItem<T>('session_data');
  },

  /**
   * Remove session data
   */
  removeSession(): void {
    secureSessionStorage.removeItem('session_data');
  },

  /**
   * Extend session
   */
  extendSession(additionalTime: number = 30 * 60 * 1000): boolean {
    return secureSessionStorage.extend('session_data', additionalTime);
  },
};

/**
 * Auto cleanup expired items every 5 minutes
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    secureLocalStorage.cleanup();
    secureSessionStorage.cleanup();
  }, 5 * 60 * 1000);
}
