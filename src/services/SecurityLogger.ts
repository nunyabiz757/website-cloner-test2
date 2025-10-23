/**
 * Security Event Logger
 * Tracks security events and logs them to Supabase
 */

import { supabase } from '../lib/supabase';
import { secureLocalStorage } from './SecureStorageService';

export type SecurityEventType =
  | 'auth.login_success'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.signup'
  | 'auth.password_reset'
  | 'session.created'
  | 'session.destroyed'
  | 'session.hijacking_detected'
  | 'session.fingerprint_mismatch'
  | 'rate_limit.exceeded'
  | 'validation.failed'
  | 'xss.attempt_blocked'
  | 'image.security_scan'
  | 'image.exif_removed'
  | 'suspicious.activity'
  | 'unauthorized.access';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id?: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  eventsByType: Record<string, number>;
  recentEvents: SecurityEvent[];
}

class SecurityLoggerService {
  private localEventQueue: SecurityEvent[] = [];
  private maxQueueSize = 100;
  private flushInterval: number | null = null;

  constructor() {
    // Flush queue every 30 seconds
    if (typeof window !== 'undefined') {
      this.flushInterval = window.setInterval(() => {
        this.flushQueue();
      }, 30000);
    }

    // Load queued events from storage
    this.loadQueue();
  }

  /**
   * Log a security event
   */
  async logEvent(
    eventType: SecurityEventType,
    severity: SecuritySeverity,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const event: SecurityEvent = {
      event_type: eventType,
      severity,
      user_id: userId,
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      metadata,
      created_at: new Date().toISOString(),
    };

    // Add to local queue
    this.localEventQueue.push(event);

    // Persist queue
    this.saveQueue();

    // Trim queue if too large
    if (this.localEventQueue.length > this.maxQueueSize) {
      this.localEventQueue = this.localEventQueue.slice(-this.maxQueueSize);
    }

    // Flush immediately for critical events
    if (severity === 'critical') {
      await this.flushQueue();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Security Event] ${eventType} (${severity})`, metadata);
    }
  }

  /**
   * Flush event queue to Supabase
   */
  private async flushQueue(): Promise<void> {
    if (this.localEventQueue.length === 0) return;

    const eventsToSend = [...this.localEventQueue];
    this.localEventQueue = [];
    this.saveQueue();

    try {
      const { error } = await supabase
        .from('security_events')
        .insert(eventsToSend);

      if (error) {
        console.error('Failed to send security events:', error);
        // Re-add events to queue on failure
        this.localEventQueue.unshift(...eventsToSend);
        this.saveQueue();
      }
    } catch (error) {
      console.error('Error flushing security events:', error);
      // Re-add events to queue on error
      this.localEventQueue.unshift(...eventsToSend);
      this.saveQueue();
    }
  }

  /**
   * Save queue to local storage
   */
  private saveQueue(): void {
    try {
      secureLocalStorage.setItem('security_event_queue', this.localEventQueue, {
        encrypt: true,
      });
    } catch (error) {
      console.error('Failed to save security event queue:', error);
    }
  }

  /**
   * Load queue from local storage
   */
  private loadQueue(): void {
    try {
      const queue = secureLocalStorage.getItem<SecurityEvent[]>('security_event_queue');
      if (queue && Array.isArray(queue)) {
        this.localEventQueue = queue;
      }
    } catch (error) {
      console.error('Failed to load security event queue:', error);
    }
  }

  /**
   * Get client IP address (best effort)
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      // Try to get IP from external service (limited calls)
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      const data = await response.json();
      return data.ip;
    } catch (error) {
      // Fallback to undefined (will be set by server if available)
      return undefined;
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    eventType: 'login_success' | 'login_failed' | 'logout' | 'signup' | 'password_reset',
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const severity: SecuritySeverity =
      eventType === 'login_failed' ? 'medium' :
      eventType === 'password_reset' ? 'medium' : 'low';

    await this.logEvent(`auth.${eventType}` as SecurityEventType, severity, metadata, userId);
  }

  /**
   * Log session events
   */
  async logSessionEvent(
    eventType: 'created' | 'destroyed' | 'hijacking_detected' | 'fingerprint_mismatch',
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const severity: SecuritySeverity =
      eventType === 'hijacking_detected' ? 'critical' :
      eventType === 'fingerprint_mismatch' ? 'high' : 'low';

    await this.logEvent(`session.${eventType}` as SecurityEventType, severity, metadata, userId);
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    endpoint: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent(
      'rate_limit.exceeded',
      'medium',
      { endpoint },
      userId
    );
  }

  /**
   * Log validation failure
   */
  async logValidationFailed(
    field: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent(
      'validation.failed',
      'low',
      { field, reason },
      userId
    );
  }

  /**
   * Log XSS attempt blocked
   */
  async logXSSAttemptBlocked(
    input: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent(
      'xss.attempt_blocked',
      'high',
      { input: input.substring(0, 200) }, // Only log first 200 chars
      userId
    );
  }

  /**
   * Log image security scan
   */
  async logImageSecurity(
    eventType: 'security_scan' | 'exif_removed',
    filename: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.logEvent(
      `image.${eventType}` as SecurityEventType,
      'low',
      { filename, ...metadata },
      userId
    );
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    description: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.logEvent(
      'suspicious.activity',
      'high',
      { description, ...metadata },
      userId
    );
  }

  /**
   * Log unauthorized access attempt
   */
  async logUnauthorizedAccess(
    resource: string,
    userId?: string
  ): Promise<void> {
    await this.logEvent(
      'unauthorized.access',
      'medium',
      { resource },
      userId
    );
  }

  /**
   * Get security metrics for current user
   */
  async getMetrics(userId: string, hours: number = 24): Promise<SecurityMetrics | null> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const events = data as SecurityEvent[];

      // Calculate metrics
      const metrics: SecurityMetrics = {
        totalEvents: events.length,
        criticalEvents: events.filter((e) => e.severity === 'critical').length,
        highEvents: events.filter((e) => e.severity === 'high').length,
        mediumEvents: events.filter((e) => e.severity === 'medium').length,
        lowEvents: events.filter((e) => e.severity === 'low').length,
        eventsByType: {},
        recentEvents: events.slice(0, 10),
      };

      // Count events by type
      events.forEach((event) => {
        metrics.eventsByType[event.event_type] =
          (metrics.eventsByType[event.event_type] || 0) + 1;
      });

      return metrics;
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return null;
    }
  }

  /**
   * Get all security events for current user
   */
  async getUserEvents(
    userId: string,
    limit: number = 50
  ): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as SecurityEvent[];
    } catch (error) {
      console.error('Failed to get user security events:', error);
      return [];
    }
  }

  /**
   * Clear local event queue
   */
  clearQueue(): void {
    this.localEventQueue = [];
    this.saveQueue();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval !== null) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush any remaining events
    this.flushQueue();
  }
}

// Export singleton instance
export const securityLogger = new SecurityLoggerService();

// Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    securityLogger.destroy();
  });
}
