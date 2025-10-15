import { IDishRepository, DishCreateData, DishUpdateData } from '../../domain/ports/IDishRepository';
import { Dish } from '../../domain/entities/Dish';
import { CreateDishDto, UpdateDishDto, DishValidator } from '../dtos/DishDto';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import { getRepository } from 'typeorm';
import { Restaurant } from '../../domain/entities/Restaurant';
import { EntityUtils } from '../../shared/utils/EntityUtils';

export class DishService {
  constructor(private dishRepository: IDishRepository) {}

  async getAllDishes(): Promise<Dish[]> {
    return await this.dishRepository.findAll();
  }

  async getDishById(id: number): Promise<Dish> {
    if (!id || isNaN(id)) {
      throw new BadRequestError('Invalid dish ID format');
    }

    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new NotFoundError('Dish not found');
    }

    return dish;
  }

  async getDishesByRestaurant(restaurantId: number): Promise<Dish[]> {
    if (!restaurantId || isNaN(restaurantId)) {
      throw new BadRequestError('Invalid restaurant ID format');
    }

    // Verify restaurant exists and is active
    const restaurantRepository = getRepository(Restaurant);
    const restaurantExists = await EntityUtils.existsAndIsActive(restaurantRepository, restaurantId);
    if (!restaurantExists) {
      throw new NotFoundError('Restaurant not found or inactive');
    }

    return await this.dishRepository.findByRestaurantId(restaurantId);
  }

  async createDish(dishData: CreateDishDto): Promise<Dish> {
    // Validate input data
    const validation = DishValidator.validateCreateDish(dishData);
    if (!validation.isValid) {
      throw new BadRequestError(validation.errors.join(', '));
    }

    // Verify restaurant exists and is active
    const restaurantRepository = getRepository(Restaurant);
    const restaurant = await EntityUtils.findOneActiveEntity(restaurantRepository, {
      where: { id: dishData.restaurant.id }
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found or inactive');
    }

    // Check if dish with same name already exists in this restaurant
    const existingDishes = await this.dishRepository.findByRestaurantId(dishData.restaurant.id);
    const duplicateName = existingDishes.find(dish => 
      dish.name.toLowerCase().trim() === dishData.name.toLowerCase().trim()
    );

    if (duplicateName) {
      throw new BadRequestError('A dish with this name already exists in this restaurant');
    }

    // Create the dish with the full restaurant object
    const dishToCreate: DishCreateData = {
      name: dishData.name,
      price: dishData.price,
      restaurant: restaurant
    };
    
    // Handle optional fields
    if (dishData.description !== undefined) {
      dishToCreate.description = dishData.description;
    }
    if (dishData.image !== undefined) {
      dishToCreate.image = dishData.image;
    }

    return await this.dishRepository.create(dishToCreate);
  }

  async updateDish(id: number, dishData: UpdateDishDto): Promise<Dish> {
    if (!id || isNaN(id)) {
      throw new BadRequestError('Invalid dish ID format');
    }

    // Validate input data
    const validation = DishValidator.validateUpdateDish(dishData);
    if (!validation.isValid) {
      throw new BadRequestError(validation.errors.join(', '));
    }

    // Check if dish exists and is active
    const existsAndActive = await this.dishRepository.existsAndIsActive(id);
    if (!existsAndActive) {
      throw new NotFoundError('Dish not found or inactive');
    }

    // Prepare the update data
    const updateData: DishUpdateData = {};
    
    // Handle basic fields
    if (dishData.name !== undefined) updateData.name = dishData.name;
    if (dishData.description !== undefined) updateData.description = dishData.description;
    if (dishData.image !== undefined) updateData.image = dishData.image;
    if (dishData.price !== undefined) updateData.price = dishData.price;

    // Handle restaurant update
    if (dishData.restaurant && dishData.restaurant.id) {
      const restaurantRepository = getRepository(Restaurant);
      const restaurant = await EntityUtils.findOneActiveEntity(restaurantRepository, {
        where: { id: dishData.restaurant.id }
      });

      if (!restaurant) {
        throw new NotFoundError('Restaurant not found or inactive');
      }

      updateData.restaurant = restaurant;
    }

    // If name is being updated, check for duplicates in the restaurant
    if (dishData.name) {
      const currentDish = await this.dishRepository.findById(id);
      if (currentDish) {
        const restaurantId = updateData.restaurant?.id || currentDish.restaurant.id;
        const existingDishes = await this.dishRepository.findByRestaurantId(restaurantId);
        const duplicateName = existingDishes.find(dish => 
          dish.id !== id && dish.name.toLowerCase().trim() === dishData.name!.toLowerCase().trim()
        );

        if (duplicateName) {
          throw new BadRequestError('A dish with this name already exists in this restaurant');
        }
      }
    }

    const updatedDish = await this.dishRepository.update(id, updateData);
    if (!updatedDish) {
      throw new BadRequestError('Failed to update dish');
    }

    return updatedDish;
  }

  async deleteDish(id: number): Promise<void> {
    if (!id || isNaN(id)) {
      throw new BadRequestError('Invalid dish ID format');
    }

    // Check if dish exists and is active
    const existsAndActive = await this.dishRepository.existsAndIsActive(id);
    if (!existsAndActive) {
      throw new NotFoundError('Dish not found or already inactive');
    }

    // Perform soft delete
    const deleted = await this.dishRepository.softDelete(id);
    if (!deleted) {
      throw new BadRequestError('Failed to delete dish');
    }
  }
}