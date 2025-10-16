import { Request, Response } from 'express';
import { getRepository } from 'typeorm';

export class DistrictController {
  static async getAll(req: Request, res: Response) {
    try {
      const districtRepository = getRepository('District');
      const districts = await districtRepository.find({
        relations: ['province']
      });
      res.json(districts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching districts', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const districtRepository = getRepository('District');
      const district = await districtRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['province']
      });
      if (!district) {
        return res.status(404).json({ message: 'District not found' });
      }
      res.json(district);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching district', error });
    }
  }

  static async getByProvinceId(req: Request, res: Response) {
    try {
      const { provinceId } = req.params;
      if (!provinceId) return res.status(400).json({ message: 'Province ID is required' });
      const districtRepository = getRepository('District');
      const districts = await districtRepository.find({
        where: { province: { id: parseInt(provinceId) } },
        relations: ['province']
      });
      res.json(districts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching districts by province', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const districtRepository = getRepository('District');
      const district = districtRepository.create(req.body);
      await districtRepository.save(district);
      res.status(201).json(district);
    } catch (error) {
      res.status(500).json({ message: 'Error creating district', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const districtRepository = getRepository('District');
      await districtRepository.update(parseInt(id), req.body);
      const updatedDistrict = await districtRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['province']
      });
      res.json(updatedDistrict);
    } catch (error) {
      res.status(500).json({ message: 'Error updating district', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: 'ID is required' });
      const districtRepository = getRepository('District');
      await districtRepository.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting district', error });
    }
  }
}
