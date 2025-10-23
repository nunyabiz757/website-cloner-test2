import { supabase } from '../lib/supabase';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
  id?: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  user_id?: string;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLocalLogs = 1000;
  private isEnabled = true;

  async log(
    level: LogLevel,
    category: string,
    message: string,
    details?: any
  ): Promise<void> {
    if (!this.isEnabled) return;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details: details ? JSON.stringify(details) : undefined,
    };

    this.logs.unshift(logEntry);

    if (this.logs.length > this.maxLocalLogs) {
      this.logs.pop();
    }

    console.log(`[${level.toUpperCase()}] [${category}] ${message}`, details || '');
  }

  debug(category: string, message: string, details?: any): Promise<void> {
    return this.log('debug', category, message, details);
  }

  info(category: string, message: string, details?: any): Promise<void> {
    return this.log('info', category, message, details);
  }

  warning(category: string, message: string, details?: any): Promise<void> {
    return this.log('warning', category, message, details);
  }

  error(category: string, message: string, details?: any): Promise<void> {
    return this.log('error', category, message, details);
  }

  success(category: string, message: string, details?: any): Promise<void> {
    return this.log('success', category, message, details);
  }

  getLocalLogs(): LogEntry[] {
    return [...this.logs];
  }

  async getDatabaseLogs(limit = 100): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(log => ({
        id: log.id,
        timestamp: log.created_at,
        level: log.level,
        category: log.category,
        message: log.message,
        details: log.details,
        user_id: log.user_id,
      }));
    } catch (error) {
      console.error('Failed to fetch logs from database:', error);
      return [];
    }
  }

  async clearDatabaseLogs(): Promise<void> {
    try {
      const { error } = await supabase.from('logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      this.info('system', 'Database logs cleared');
    } catch (error) {
      console.error('Failed to clear database logs:', error);
      throw error;
    }
  }

  clearLocalLogs(): void {
    this.logs = [];
    this.info('system', 'Local logs cleared');
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }
}

export const loggingService = new LoggingService();
