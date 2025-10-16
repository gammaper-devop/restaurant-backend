import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

@Entity('error_logs')
@Index(['timestamp', 'severity'])
@Index(['userId'])
@Index(['endpoint'])
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  message!: string;

  @Column({ type: 'text', nullable: true })
  stackTrace?: string;

  @Column({
    type: 'enum',
    enum: ErrorSeverity,
    default: ErrorSeverity.MEDIUM
  })
  severity!: ErrorSeverity;

  @Column({
    type: 'enum',
    enum: ErrorCategory,
    default: ErrorCategory.UNKNOWN
  })
  category!: ErrorCategory;

  @Column({ type: 'varchar', length: 10 })
  statusCode!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId!: string;

  @Column({ type: 'json', nullable: true })
  requestBody!: any;

  @Column({ type: 'json', nullable: true })
  requestHeaders!: any;

  @Column({ type: 'json', nullable: true })
  errorContext!: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  errorCode!: string;

  @Column({ type: 'boolean', default: false })
  isResolved!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolvedBy!: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serviceName!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serviceVersion!: string;

  @Column({ type: 'json', nullable: true })
  environmentInfo!: any;

  // Método helper para determinar severidad basado en status code
  static getSeverityFromStatusCode(statusCode: number): ErrorSeverity {
    if (statusCode >= 500) return ErrorSeverity.CRITICAL;
    if (statusCode >= 400 && statusCode < 500) return ErrorSeverity.MEDIUM;
    if (statusCode >= 300 && statusCode < 400) return ErrorSeverity.LOW;
    return ErrorSeverity.LOW;
  }

  // Método helper para determinar categoría basado en el error
  static getCategoryFromError(error: any): ErrorCategory {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return ErrorCategory.AUTHENTICATION;
    }
    if (error.message?.includes('forbidden') || error.message?.includes('unauthorized')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (error.message?.includes('validation') || error.message?.includes('required')) {
      return ErrorCategory.VALIDATION;
    }
    if (error.message?.includes('duplicate key') || error.message?.includes('foreign key')) {
      return ErrorCategory.DATABASE;
    }
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }
    if (error instanceof Error && error.stack) {
      return ErrorCategory.SYSTEM;
    }
    return ErrorCategory.UNKNOWN;
  }
}
