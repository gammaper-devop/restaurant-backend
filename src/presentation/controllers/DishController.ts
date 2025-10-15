import { Request, Response } from 'express';
import { DishService } from '../../application/services/DishService';
import { DishRepository } from '../../infrastructure/repositories/DishRepository';
import { ResponseHandler } from '../../shared/responses/ApiResponse';
import { BadRequestError } from '../../shared/errors';

export class DishController {
  private static dishService = new DishService(new DishRepository());

  // Get all active dishes (NO AUTH)
  static async getAll(req: Request, res: Response) {
    try {
      const dishes = await DishController.dishService.getAllDishes();
      
      const response = ResponseHandler.success(dishes, 'Dishes retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Get dish by ID (NO AUTH)
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Dish ID is required');
      }

      const dishId = parseInt(id);
      if (isNaN(dishId)) {
        throw new BadRequestError('Invalid dish ID format');
      }

      const dish = await DishController.dishService.getDishById(dishId);

      const response = ResponseHandler.success(dish, 'Dish retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Get dishes by restaurant ID (NO AUTH)
  static async getByRestaurant(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      if (!restaurantId) {
        throw new BadRequestError('Restaurant ID is required');
      }

      const restId = parseInt(restaurantId);
      if (isNaN(restId)) {
        throw new BadRequestError('Invalid restaurant ID format');
      }

      const dishes = await DishController.dishService.getDishesByRestaurant(restId);

      const response = ResponseHandler.success(dishes, 'Restaurant dishes retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Create new dish (WITH AUTH)
  static async create(req: Request, res: Response) {
    try {
      const dish = await DishController.dishService.createDish(req.body);

      const response = ResponseHandler.success(dish, 'Dish created successfully', 201);
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Update dish (WITH AUTH)
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Dish ID is required');
      }

      const dishId = parseInt(id);
      if (isNaN(dishId)) {
        throw new BadRequestError('Invalid dish ID format');
      }

      const updatedDish = await DishController.dishService.updateDish(dishId, req.body);

      const response = ResponseHandler.success(updatedDish, 'Dish updated successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Soft delete dish (WITH AUTH)
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Dish ID is required');
      }

      const dishId = parseInt(id);
      if (isNaN(dishId)) {
        throw new BadRequestError('Invalid dish ID format');
      }

      await DishController.dishService.deleteDish(dishId);

      const response = ResponseHandler.success(null, 'Dish deleted successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }
}