import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { RestaurantLocation } from '../../domain/entities/RestaurantLocation';
import { EntityUtils } from '../../shared/utils/EntityUtils';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { ResponseHandler } from '../../shared/responses/ApiResponse';

export class RestaurantLocationController {
  static async getAll(req: Request, res: Response) {
    try {
      const locationRepository = getRepository(RestaurantLocation);
      const locations = await EntityUtils.findActiveEntities(locationRepository, {
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      
      const response = ResponseHandler.success(locations, 'Restaurant locations retrieved successfully');
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
        throw new BadRequestError('Location ID is required');
      }

      const locationId = parseInt(id);
      if (isNaN(locationId)) {
        throw new BadRequestError('Invalid location ID format');
      }

      const locationRepository = getRepository(RestaurantLocation);
      const location = await EntityUtils.findOneActiveEntity(locationRepository, {
        where: { id: locationId },
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      
      if (!location) {
        throw new NotFoundError('Restaurant location not found');
      }

      const response = ResponseHandler.success(location, 'Restaurant location retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  static async getByRestaurantId(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      if (!restaurantId) {
        throw new BadRequestError('Restaurant ID is required');
      }

      const restaurantIdInt = parseInt(restaurantId);
      if (isNaN(restaurantIdInt)) {
        throw new BadRequestError('Invalid restaurant ID format');
      }

      const locationRepository = getRepository(RestaurantLocation);
      const locations = await EntityUtils.findActiveEntities(locationRepository, {
        where: { restaurant: { id: restaurantIdInt } },
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });

      const response = ResponseHandler.success(locations, 'Restaurant locations retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const locationRepository = getRepository(RestaurantLocation);
      const location = locationRepository.create(req.body);
      await locationRepository.save(location);
      res.status(201).json(location);
    } catch (error) {
      res.status(500).json({ message: 'Error creating restaurant location', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const locationRepository = getRepository(RestaurantLocation);
      await locationRepository.update(parseInt(id), req.body);
      const updatedLocation = await locationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      res.json(updatedLocation);
    } catch (error) {
      res.status(500).json({ message: 'Error updating restaurant location', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Location ID is required');
      }

      const locationId = parseInt(id);
      if (isNaN(locationId)) {
        throw new BadRequestError('Invalid location ID format');
      }

      const locationRepository = getRepository(RestaurantLocation);
      
      // Check if location exists and is active
      const existsAndActive = await EntityUtils.existsAndIsActive(locationRepository, locationId);
      if (!existsAndActive) {
        throw new NotFoundError('Restaurant location not found or already inactive');
      }

      // Perform soft delete
      const deleted = await EntityUtils.softDelete(locationRepository, locationId);
      if (!deleted) {
        throw new BadRequestError('Failed to delete restaurant location');
      }

      const response = ResponseHandler.success(null, 'Restaurant location deleted successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }
}
