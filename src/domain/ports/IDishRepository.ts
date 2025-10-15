import { Dish } from '../entities/Dish';
import { Restaurant } from '../entities/Restaurant';

// Types for repository operations
export interface DishCreateData {
  name: string;
  description?: string;
  image?: string;
  price: number;
  restaurant: Restaurant;
}

export interface DishUpdateData {
  name?: string;
  description?: string | null;
  image?: string | null;
  price?: number;
  restaurant?: Restaurant;
}

export interface IDishRepository {
  findAll(): Promise<Dish[]>;
  findById(id: number): Promise<Dish | null>;
  findByRestaurantId(restaurantId: number): Promise<Dish[]>;
  create(dish: DishCreateData): Promise<Dish>;
  update(id: number, dish: DishUpdateData): Promise<Dish | null>;
  softDelete(id: number): Promise<boolean>;
  exists(id: number): Promise<boolean>;
  existsAndIsActive(id: number): Promise<boolean>;
}
