import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

export class ProvinceController {
  static async getAll(req: Request, res: Response) {
    try {
      const provinceRepository = getRepository('Province');
      const provinces = await provinceRepository.find({
        relations: ['city', 'districts']
      });
      res.json(provinces);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching provinces', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const provinceRepository = getRepository('Province');
      const province = await provinceRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['city', 'districts']
      });
      if (!province) {
        return res.status(404).json({ message: 'Province not found' });
      }
      res.json(province);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching province', error });
    }
  }

  static async getByCityId(req: Request, res: Response) {
    try {
      const { cityId } = req.params;
      if (!cityId) return res.status(400).json({ message: 'City ID is required' });
      const provinceRepository = getRepository('Province');
      const provinces = await provinceRepository.find({
        where: { city: { id: parseInt(cityId) } },
        relations: ['city', 'districts']
      });
      res.json(provinces);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching provinces by city', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const provinceRepository = getRepository('Province');
      const province = provinceRepository.create(req.body);
      await provinceRepository.save(province);
      res.status(201).json(province);
    } catch (error) {
      res.status(500).json({ message: 'Error creating province', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const provinceRepository = getRepository('Province');
      await provinceRepository.update(parseInt(id), req.body);
      const updatedProvince = await provinceRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['city', 'districts']
      });
      res.json(updatedProvince);
    } catch (error) {
      res.status(500).json({ message: 'Error updating province', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const provinceRepository = getRepository('Province');
      await provinceRepository.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting province', error });
    }
  }
}
