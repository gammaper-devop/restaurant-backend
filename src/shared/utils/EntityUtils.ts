import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { BaseEntity } from '../../domain/entities/BaseEntity';

export class EntityUtils {
  /**
   * Find all active entities
   */
  static findActiveEntities<T extends BaseEntity>(
    repository: Repository<T>,
    options?: FindManyOptions<T>
  ): Promise<T[]> {
    const whereCondition = options?.where 
      ? Array.isArray(options.where)
        ? options.where.map(condition => ({ ...condition, active: true }))
        : { ...options.where, active: true }
      : { active: true };

    return repository.find({
      ...options,
      where: whereCondition as any
    });
  }

  /**
   * Find one active entity
   */
  static findOneActiveEntity<T extends BaseEntity>(
    repository: Repository<T>,
    options?: FindOneOptions<T>
  ): Promise<T | null> {
    const whereCondition = options?.where 
      ? Array.isArray(options.where)
        ? options.where.map(condition => ({ ...condition, active: true }))
        : { ...options.where, active: true }
      : { active: true };

    return repository.findOne({
      ...options,
      where: whereCondition as any
    });
  }

  /**
   * Soft delete an entity by setting active = false
   */
  static async softDelete<T extends BaseEntity>(
    repository: Repository<T>,
    id: number
  ): Promise<boolean> {
    const result = await repository.update(id, { active: false } as any);
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Soft delete multiple entities by setting active = false
   */
  static async softDeleteMany<T extends BaseEntity>(
    repository: Repository<T>,
    ids: number[]
  ): Promise<boolean> {
    const result = await repository.update(ids, { active: false } as any);
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Restore a soft deleted entity by setting active = true
   */
  static async restore<T extends BaseEntity>(
    repository: Repository<T>,
    id: number
  ): Promise<boolean> {
    const result = await repository.update(id, { active: true } as any);
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Check if entity exists and is active
   */
  static async existsAndIsActive<T extends BaseEntity>(
    repository: Repository<T>,
    id: number
  ): Promise<boolean> {
    const entity = await repository.findOne({
      where: { id, active: true } as any
    });
    return entity !== null;
  }
}