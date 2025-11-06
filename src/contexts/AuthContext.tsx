import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { generateFingerprint, detectSuspiciousChange, DeviceFingerprint } from '../utils/security/fingerprint';
import { securityLogger } from '../services/SecurityLogger';
import { TokenStorage, SessionStorage } from '../services/SecureStorageService';
import { authLimiter } from '../utils/security/rateLimiter';
import { validateEmail, validatePassword } from '../utils/security/validator';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  fingerprint: DeviceFingerprint | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inactivity timeout (configurable via env, disabled by default for better UX)
// Set VITE_SESSION_TIMEOUT in .env to enable (e.g., 604800000 for 7 days)
const INACTIVITY_TIMEOUT = import.meta.env.VITE_SESSION_TIMEOUT
  ? parseInt(import.meta.env.VITE_SESSION_TIMEOUT)
  : 0; // 0 = disabled (users stay logged in until manual logout or token expiry)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);

  // Initialize fingerprint
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await generateFingerprint();
        setFingerprint(fp);

        // Check for suspicious changes
        const suspiciousCheck = await detectSuspiciousChange();
        if (suspiciousCheck.suspicious) {
          await securityLogger.logSessionEvent(
            'fingerprint_mismatch',
            user?.id,
            { reason: suspiciousCheck.reason }
          );
        }
      } catch (error) {
        console.error('Fingerprint generation error:', error);
      }
    };

    initFingerprint();
  }, [user?.id]);

  // Setup inactivity logout (only if INACTIVITY_TIMEOUT is set and > 0)
  useEffect(() => {
    if (!user || INACTIVITY_TIMEOUT <= 0) return;

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = window.setTimeout(() => {
        securityLogger.logSessionEvent('destroyed', user.id, { reason: 'inactivity_timeout' });
        signOut();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Start timer

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session) {
          // Log session creation
          await securityLogger.logSessionEvent('created', session.user.id);

          // Store session data
          SessionStorage.setSession(session.access_token, {
            user: session.user,
          });
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth initialization error:', error);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (_event === 'SIGNED_IN' && session) {
        await securityLogger.logAuthEvent('login_success', session.user.id);
      } else if (_event === 'SIGNED_OUT') {
        await securityLogger.logAuthEvent('logout', user?.id);
        TokenStorage.clearAll();
        SessionStorage.removeSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      await securityLogger.logValidationFailed('email', emailValidation.error || 'Invalid');
      return { error: { message: emailValidation.error } };
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      await securityLogger.logValidationFailed('password', passwordValidation.error || 'Invalid');
      return { error: { message: passwordValidation.error } };
    }

    // Check rate limit
    const rateLimitCheck = authLimiter.check('signup');
    if (!rateLimitCheck.allowed) {
      return { error: { message: 'Too many signup attempts. Please try again later.' } };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: emailValidation.sanitized,
        password,
        options: {
          data: { name },
        },
      });

      if (!error) {
        await securityLogger.logAuthEvent('signup', undefined, { email: emailValidation.sanitized });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { error: { message: 'Invalid email format' } };
    }

    // Check rate limit (5 attempts per 15 minutes)
    const rateLimitCheck = authLimiter.check('login');
    if (!rateLimitCheck.allowed) {
      await securityLogger.logAuthEvent('login_failed', undefined, {
        email: emailValidation.sanitized,
        reason: 'rate_limit_exceeded',
      });
      return { error: { message: 'Too many login attempts. Please try again later.' } };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitized,
        password,
      });

      if (error) {
        // Log failed login
        await securityLogger.logAuthEvent('login_failed', undefined, {
          email: emailValidation.sanitized,
        });
      }

      return { error };
    } catch (error) {
      await securityLogger.logAuthEvent('login_failed', undefined, {
        email: emailValidation.sanitized,
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    // Check rate limit
    const rateLimitCheck = authLimiter.check('google_login');
    if (!rateLimitCheck.allowed) {
      return { error: { message: 'Too many login attempts. Please try again later.' } };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await securityLogger.logAuthEvent('logout', user?.id);
    TokenStorage.clearAll();
    SessionStorage.removeSession();
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    fingerprint,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
