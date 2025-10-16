import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

export class RestaurantLocationController {
  static async getAll(req: Request, res: Response) {
    try {
      const locationRepository = getRepository('RestaurantLocation');
      const locations = await locationRepository.find({
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching restaurant locations', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const locationRepository = getRepository('RestaurantLocation');
      const location = await locationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      if (!location) {
        return res.status(404).json({ message: 'Restaurant location not found' });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching restaurant location', error });
    }
  }

  static async getByRestaurantId(req: Request, res: Response) {
    try {
      const { restaurantId } = req.params;
      if (!restaurantId) return res.status(400).json({ message: 'Restaurant ID is required' });
      const locationRepository = getRepository('RestaurantLocation');
      const locations = await locationRepository.find({
        where: { restaurant: { id: parseInt(restaurantId) } },
        relations: ['restaurant', 'district', 'district.province', 'district.province.city']
      });
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching restaurant locations', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const locationRepository = getRepository('RestaurantLocation');
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
      const locationRepository = getRepository('RestaurantLocation');
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
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const locationRepository = getRepository('RestaurantLocation');
      await locationRepository.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting restaurant location', error });
    }
  }
}
