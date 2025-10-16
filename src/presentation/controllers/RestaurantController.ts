import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Restaurant } from '../../domain/entities/Restaurant';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { ResponseHandler } from '../../shared/responses/ApiResponse';

export class RestaurantController {
  static async getAll(req: Request, res: Response) {
    try {
      const restaurantRepository = getRepository(Restaurant);
      const restaurants = await restaurantRepository.find({
        relations: ['category', 'locations', 'locations.district', 'locations.district.province', 'locations.district.province.city']
      });
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching restaurants', error });
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
      const restaurant = await restaurantRepository.findOne({
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
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const restaurantRepository = getRepository(Restaurant);
      await restaurantRepository.update(parseInt(id), req.body);
      const updatedRestaurant = await restaurantRepository.findOneBy({ id: parseInt(id) });
      res.json(updatedRestaurant);
    } catch (error) {
      res.status(500).json({ message: 'Error updating restaurant', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const restaurantRepository = getRepository(Restaurant);
      await restaurantRepository.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting restaurant', error });
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
