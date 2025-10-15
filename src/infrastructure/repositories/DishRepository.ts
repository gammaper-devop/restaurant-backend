import { Repository, getRepository } from 'typeorm';
import { Dish } from '../../domain/entities/Dish';
import { IDishRepository, DishCreateData, DishUpdateData } from '../../domain/ports/IDishRepository';
import { EntityUtils } from '../../shared/utils/EntityUtils';

export class DishRepository implements IDishRepository {
  private repository: Repository<Dish>;

  constructor() {
    this.repository = getRepository(Dish);
  }

  async findAll(): Promise<Dish[]> {
    return await EntityUtils.findActiveEntities(this.repository, {
      relations: ['restaurant']
    });
  }

  async findById(id: number): Promise<Dish | null> {
    return await EntityUtils.findOneActiveEntity(this.repository, {
      where: { id },
      relations: ['restaurant']
    });
  }

  async findByRestaurantId(restaurantId: number): Promise<Dish[]> {
    return await EntityUtils.findActiveEntities(this.repository, {
      where: { restaurant: { id: restaurantId } },
      relations: ['restaurant']
    });
  }

  async create(dishData: DishCreateData): Promise<Dish> {
    const dish = this.repository.create(dishData);
    return await this.repository.save(dish);
  }

  async update(id: number, dishData: DishUpdateData): Promise<Dish | null> {
    await this.repository.update(id, dishData as any);
    return await this.findById(id);
  }

  async softDelete(id: number): Promise<boolean> {
    return await EntityUtils.softDelete(this.repository, id);
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsAndIsActive(id: number): Promise<boolean> {
    return await EntityUtils.existsAndIsActive(this.repository, id);
  }
}