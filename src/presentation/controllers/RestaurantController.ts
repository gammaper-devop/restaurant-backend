import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Restaurant } from '../../domain/entities/Restaurant';
import { Dish } from '../../domain/entities/Dish';
import { Menu } from '../../domain/entities/Menu';
import { RestaurantLocation } from '../../domain/entities/RestaurantLocation';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { ResponseHandler } from '../../shared/responses/ApiResponse';
import { EntityUtils } from '../../shared/utils/EntityUtils';

export class RestaurantController {
  static async getAll(req: Request, res: Response) {
    try {
      const restaurantRepository = getRepository(Restaurant);
      const restaurants = await EntityUtils.findActiveEntities(restaurantRepository, {
        relations: ['category', 'locations', 'locations.district', 'locations.district.province', 'locations.district.province.city']
      });
      
      const response = ResponseHandler.success(restaurants, 'Restaurants retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Restaurant ID is required');
      }

      const restaurantId = parseInt(id);
      if (isNaN(restaurantId)) {
        throw new BadRequestError('Invalid restaurant ID format');
      }

      const restaurantRepository = getRepository(Restaurant);
      const restaurant = await EntityUtils.findOneActiveEntity(restaurantRepository, {
        where: { id: restaurantId },
        relations: ['category', 'locations', 'locations.district', 'locations.district.province', 'locations.district.province.city', 'dishes', 'menus']
      });

      if (!restaurant) {
        throw new NotFoundError('Restaurant not found');
      }

      const response = ResponseHandler.success(restaurant, 'Restaurant retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      // Error will be handled by the errorHandler middleware
      throw error;
    }
  }

  static async getByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const { includeInactive } = req.query;
      
      if (!categoryId) {
        throw new BadRequestError('Category ID is required');
      }

      const categoryIdInt = parseInt(categoryId);
      if (isNaN(categoryIdInt)) {
        throw new BadRequestError('Invalid category ID format');
      }

      const restaurantRepository = getRepository(Restaurant);
      
      // Determine if we should include inactive restaurants
      const shouldIncludeInactive = includeInactive === 'true';
      
      let restaurants;
      if (shouldIncludeInactive) {
        // Get all restaurants (active and inactive) for this category
        restaurants = await restaurantRepository.find({
          where: { category: { id: categoryIdInt } },
          relations: ['category', 'locations', 'locations.district', 'locations.district.province', 'locations.district.province.city']
        });
      } else {
        // Get only active restaurants for this category
        restaurants = await EntityUtils.findActiveEntities(restaurantRepository, {
          where: { category: { id: categoryIdInt } },
          relations: ['category', 'locations', 'locations.district', 'locations.district.province', 'locations.district.province.city']
        });
      }
      
      // Create response message
      const statusText = shouldIncludeInactive ? 'all' : 'active';
      let message: string;
      
      if (restaurants.length > 0) {
        const categoryName = restaurants[0]?.category?.name || 'Unknown';
        message = `Found ${restaurants.length} ${statusText} restaurant(s) in category "${categoryName}"`;
      } else {
        message = `No ${statusText} restaurants found for category ID ${categoryIdInt}`;
      }
      
      const response = ResponseHandler.success(restaurants, message);
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, category } = req.body;

      if (!name || !category) {
        throw new BadRequestError('Restaurant name and category are required');
      }

      const restaurantRepository = getRepository(Restaurant);
      const restaurant = restaurantRepository.create(req.body);
      const savedRestaurant = await restaurantRepository.save(restaurant);

      const response = ResponseHandler.success(savedRestaurant, 'Restaurant created successfully', 201);
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      // Error will be handled by the errorHandler middleware
      throw error;
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Restaurant ID is required');
      }

      const restaurantId = parseInt(id);
      if (isNaN(restaurantId)) {
        throw new BadRequestError('Invalid restaurant ID format');
      }

      const restaurantRepository = getRepository(Restaurant);
      
      // Check if restaurant exists and is active
      const existsAndActive = await EntityUtils.existsAndIsActive(restaurantRepository, restaurantId);
      if (!existsAndActive) {
        throw new NotFoundError('Restaurant not found or inactive');
      }

      await restaurantRepository.update(restaurantId, req.body);
      const updatedRestaurant = await EntityUtils.findOneActiveEntity(restaurantRepository, {
        where: { id: restaurantId },
        relations: ['category', 'locations']
      });

      const response = ResponseHandler.success(updatedRestaurant, 'Restaurant updated successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Restaurant ID is required');
      }

      const restaurantId = parseInt(id);
      if (isNaN(restaurantId)) {
        throw new BadRequestError('Invalid restaurant ID format');
      }

      const restaurantRepository = getRepository(Restaurant);
      
      // Check if restaurant exists and is active
      const existsAndActive = await EntityUtils.existsAndIsActive(restaurantRepository, restaurantId);
      if (!existsAndActive) {
        throw new NotFoundError('Restaurant not found or already inactive');
      }

      // Perform cascade soft delete
      await RestaurantController.performCascadeSoftDelete(restaurantId);

      const response = ResponseHandler.success(null, 'Restaurant and related entities deleted successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Helper method for cascade soft delete
  private static async performCascadeSoftDelete(restaurantId: number): Promise<void> {
    try {
      // 1. Soft delete all dishes for this restaurant
      try {
        const dishRepository = getRepository(Dish);
        const dishes = await dishRepository.find({
          where: { restaurant: { id: restaurantId }, active: true },
        });
        
        if (dishes.length > 0) {
          const dishIds = dishes.map(dish => dish.id);
          await EntityUtils.softDeleteMany(dishRepository, dishIds);
        }
      } catch (err) {
        console.warn('Error soft deleting dishes:', err);
      }

      // 2. Soft delete all menus for this restaurant
      try {
        const menuRepository = getRepository(Menu);
        const menus = await menuRepository.find({
          where: { restaurant: { id: restaurantId }, active: true },
        });
        
        if (menus.length > 0) {
          const menuIds = menus.map(menu => menu.id);
          await EntityUtils.softDeleteMany(menuRepository, menuIds);
        }
      } catch (err) {
        console.warn('Error soft deleting menus:', err);
      }

      // 3. Soft delete all restaurant locations
      try {
        const locationRepository = getRepository(RestaurantLocation);
        const locations = await locationRepository.find({
          where: { restaurant: { id: restaurantId }, active: true },
        });
        
        if (locations.length > 0) {
          const locationIds = locations.map(location => location.id);
          await EntityUtils.softDeleteMany(locationRepository, locationIds);
        }
      } catch (err) {
        console.warn('Error soft deleting locations:', err);
      }

      // 4. Finally, soft delete the restaurant itself
      const restaurantRepository = getRepository(Restaurant);
      await EntityUtils.softDelete(restaurantRepository, restaurantId);
    } catch (error) {
      console.error('Error in cascade soft delete:', error);
      throw error;
    }
  }

  static async getNearby(req: Request, res: Response) {
    try {
      const { lat, lng, radius = '10' } = req.query; // radius in km
      if (!lat || !lng) return res.status(400).json({ message: 'Latitude and longitude are required' });
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);
      const radiusNum = parseFloat(radius as string);

      // Query all restaurant locations with restaurant data
      const locationRepository = getRepository('RestaurantLocation');

      const locationsWithDistance = await locationRepository
        .createQueryBuilder('location')
        .leftJoinAndSelect('location.restaurant', 'restaurant')
        .leftJoinAndSelect('location.district', 'district')
        .leftJoinAndSelect('district.province', 'province')
        .leftJoinAndSelect('province.city', 'city')
        .leftJoinAndSelect('restaurant.category', 'category')
        .where('location.active = :active', { active: true })
        .andWhere('restaurant.active = :restaurantActive', { restaurantActive: true })
        .select([
          'location.id',
          'location.address',
          'location.latitude',
          'location.longitude',
          'restaurant.id',
          'restaurant.name',
          'restaurant.logo',
          'restaurant.phone',
          'category.id',
          'category.name',
          'district.id',
          'district.name',
          'province.id',
          'province.name',
          'city.id',
          'city.name',
          `6371 * acos(cos(radians(${latNum})) * cos(radians(location.latitude)) * cos(radians(location.longitude) - radians(${lngNum})) + sin(radians(${latNum})) * sin(radians(location.latitude))) AS distance`
        ])
        .having('distance < :radius', { radius: radiusNum })
        .orderBy('distance')
        .getRawAndEntities();

      // Group by restaurant and keep only the nearest location
      const restaurantMap = new Map();
      locationsWithDistance.raw.forEach((raw, index) => {
        const restaurantId = raw.restaurant_id;
        const distance = parseFloat(raw.distance);

        if (!restaurantMap.has(restaurantId) || distance < restaurantMap.get(restaurantId).distance) {
          restaurantMap.set(restaurantId, {
            ...locationsWithDistance.entities[index],
            distance: distance
          });
        }
      });

      const nearbyRestaurants = Array.from(restaurantMap.values());

      res.json(nearbyRestaurants);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching nearby restaurants', error });
    }
  }
}
