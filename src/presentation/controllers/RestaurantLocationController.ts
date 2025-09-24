import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { RestaurantLocation } from '../../domain/entities/RestaurantLocation';
import { EntityUtils } from '../../shared/utils/EntityUtils';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import { ResponseHandler } from '../../shared/responses/ApiResponse';
import { OperatingHours } from '../../domain/types/OperatingHours';
import { OperatingHoursUtils } from '../../shared/utils/OperatingHoursUtils';

export class RestaurantLocationController {
  static async getAll(req: Request, res: Response) {
    try {
      const locationRepository = getRepository(RestaurantLocation);
      const locations = await EntityUtils.findActiveEntities(locationRepository, {
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      
      // Add current status to each location
      const locationsWithStatus = locations.map(location => ({
        ...location,
        isCurrentlyOpen: OperatingHoursUtils.isCurrentlyOpen(location.operatingHours)
      }));
      
      const response = ResponseHandler.success(locationsWithStatus, 'Restaurant locations retrieved successfully');
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

      // Add current status to response
      const locationWithStatus = {
        ...location,
        isCurrentlyOpen: OperatingHoursUtils.isCurrentlyOpen(location.operatingHours)
      };

      const response = ResponseHandler.success(locationWithStatus, 'Restaurant location retrieved successfully');
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

      // Add current status to each location
      const locationsWithStatus = locations.map(location => ({
        ...location,
        isCurrentlyOpen: OperatingHoursUtils.isCurrentlyOpen(location.operatingHours)
      }));

      const response = ResponseHandler.success(locationsWithStatus, 'Restaurant locations retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { operatingHours, ...locationData } = req.body;
      
      // Validate and sanitize operating hours if provided
      let finalOperatingHours: OperatingHours;
      if (operatingHours) {
        const sanitizedHours = OperatingHoursUtils.sanitizeOperatingHours(operatingHours);
        const validation = OperatingHoursUtils.validateOperatingHours(sanitizedHours);
        
        if (!validation.isValid) {
          throw new BadRequestError(`Invalid operating hours: ${validation.errors.join(', ')}`);
        }
        
        finalOperatingHours = sanitizedHours;
      } else {
        finalOperatingHours = OperatingHoursUtils.getDefaultOperatingHours();
      }
      
      const locationRepository = getRepository(RestaurantLocation);
      const location = locationRepository.create({
        ...locationData,
        operatingHours: finalOperatingHours
      });
      
      const savedLocation = await locationRepository.save(location);
      
      // Ensure we get a single entity (not an array)
      const singleLocation = Array.isArray(savedLocation) ? savedLocation[0] : savedLocation;
      
      if (!singleLocation) {
        throw new BadRequestError('Failed to create restaurant location');
      }
      
      // Add current status to response
      const locationWithStatus = {
        ...singleLocation,
        isCurrentlyOpen: OperatingHoursUtils.isCurrentlyOpen(singleLocation.operatingHours)
      };
      
      const response = ResponseHandler.success(locationWithStatus, 'Restaurant location created successfully', 201);
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Location ID is required');
      }
      
      const locationId = parseInt(id);
      if (isNaN(locationId)) {
        throw new BadRequestError('Invalid location ID format');
      }
      
      const { operatingHours, ...locationData } = req.body;
      
      const locationRepository = getRepository(RestaurantLocation);
      
      // Check if location exists and is active
      const existsAndActive = await EntityUtils.existsAndIsActive(locationRepository, locationId);
      if (!existsAndActive) {
        throw new NotFoundError('Restaurant location not found or inactive');
      }
      
      let updateData: any = { ...locationData };
      
      // Validate and sanitize operating hours if provided
      if (operatingHours) {
        const sanitizedHours = OperatingHoursUtils.sanitizeOperatingHours(operatingHours);
        const validation = OperatingHoursUtils.validateOperatingHours(sanitizedHours);
        
        if (!validation.isValid) {
          throw new BadRequestError(`Invalid operating hours: ${validation.errors.join(', ')}`);
        }
        
        updateData.operatingHours = sanitizedHours;
      }
      
      await locationRepository.update(locationId, updateData);
      
      const updatedLocation = await EntityUtils.findOneActiveEntity(locationRepository, {
        where: { id: locationId },
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      
      if (!updatedLocation) {
        throw new NotFoundError('Restaurant location not found after update');
      }
      
      // Add current status to response
      const locationWithStatus = {
        ...updatedLocation,
        isCurrentlyOpen: OperatingHoursUtils.isCurrentlyOpen(updatedLocation.operatingHours)
      };
      
      const response = ResponseHandler.success(locationWithStatus, 'Restaurant location updated successfully');
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

  /**
   * Updates only the operating hours for a restaurant location
   */
  static async updateOperatingHours(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Location ID is required');
      }

      const locationId = parseInt(id);
      if (isNaN(locationId)) {
        throw new BadRequestError('Invalid location ID format');
      }

      const { operatingHours } = req.body;
      if (!operatingHours) {
        throw new BadRequestError('Operating hours data is required');
      }

      const locationRepository = getRepository(RestaurantLocation);
      
      // Check if location exists and is active
      const existsAndActive = await EntityUtils.existsAndIsActive(locationRepository, locationId);
      if (!existsAndActive) {
        throw new NotFoundError('Restaurant location not found or inactive');
      }

      // Validate and sanitize operating hours
      const sanitizedHours = OperatingHoursUtils.sanitizeOperatingHours(operatingHours);
      const validation = OperatingHoursUtils.validateOperatingHours(sanitizedHours);
      
      if (!validation.isValid) {
        throw new BadRequestError(`Invalid operating hours: ${validation.errors.join(', ')}`);
      }

      await locationRepository.update(locationId, { operatingHours: sanitizedHours });
      
      const updatedLocation = await EntityUtils.findOneActiveEntity(locationRepository, {
        where: { id: locationId },
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });

      if (!updatedLocation) {
        throw new NotFoundError('Restaurant location not found after update');
      }

      // Add current status to response
      const locationWithStatus = {
        ...updatedLocation,
        isCurrentlyOpen: OperatingHoursUtils.isCurrentlyOpen(updatedLocation.operatingHours)
      };

      const response = ResponseHandler.success(locationWithStatus, 'Operating hours updated successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a restaurant location is currently open
   */
  static async isCurrentlyOpen(req: Request, res: Response) {
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
        where: { id: locationId }
      });

      if (!location) {
        throw new NotFoundError('Restaurant location not found');
      }

      const isOpen = OperatingHoursUtils.isCurrentlyOpen(location.operatingHours);
      const nextOpening = !isOpen ? OperatingHoursUtils.getNextOpeningTime(location.operatingHours) : null;

      const result = {
        locationId: location.id,
        isCurrentlyOpen: isOpen,
        currentTime: new Date().toISOString(),
        nextOpeningTime: nextOpening?.toISOString() || null
      };

      const response = ResponseHandler.success(result, 'Opening status retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a restaurant location is open at a specific date/time
   */
  static async isOpenAt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { datetime } = req.params;
      
      if (!id) {
        throw new BadRequestError('Location ID is required');
      }
      
      if (!datetime) {
        throw new BadRequestError('Datetime is required');
      }

      const locationId = parseInt(id);
      if (isNaN(locationId)) {
        throw new BadRequestError('Invalid location ID format');
      }

      const checkDateTime = new Date(datetime);
      if (isNaN(checkDateTime.getTime())) {
        throw new BadRequestError('Invalid datetime format. Use ISO 8601 format');
      }

      const locationRepository = getRepository(RestaurantLocation);
      const location = await EntityUtils.findOneActiveEntity(locationRepository, {
        where: { id: locationId }
      });

      if (!location) {
        throw new NotFoundError('Restaurant location not found');
      }

      const isOpen = OperatingHoursUtils.isOpenAt(location.operatingHours, checkDateTime);

      const result = {
        locationId: location.id,
        checkDateTime: checkDateTime.toISOString(),
        isOpen
      };

      const response = ResponseHandler.success(result, 'Opening status for specified time retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets all currently open restaurant locations
   */
  static async getCurrentlyOpenLocations(req: Request, res: Response) {
    try {
      const locationRepository = getRepository(RestaurantLocation);
      const locations = await EntityUtils.findActiveEntities(locationRepository, {
        relations: ['restaurant', 'restaurant.category', 'district', 'district.province', 'district.province.city']
      });

      const openLocations = locations.filter(location => 
        OperatingHoursUtils.isCurrentlyOpen(location.operatingHours)
      );

      const locationsWithStatus = openLocations.map(location => ({
        ...location,
        isCurrentlyOpen: true
      }));

      const response = ResponseHandler.success(
        locationsWithStatus, 
        `Found ${openLocations.length} currently open restaurant locations`
      );
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }
}
