export interface StructuredLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
}

export class Logger {
  private static format(level: StructuredLog['level'], message: string, context?: Record<string, unknown>, traceId?: string): string {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId
    };
    return JSON.stringify(log);
  }

  static info(message: string, context?: Record<string, unknown>, traceId?: string) {
    console.log(this.format('INFO', message, context, traceId));
  }

  static warn(message: string, context?: Record<string, unknown>, traceId?: string) {
    console.warn(this.format('WARN', message, context, traceId));
  }

  static error(message: string, context?: Record<string, unknown>, traceId?: string) {
    console.error(this.format('ERROR', message, context, traceId));
  }
}
