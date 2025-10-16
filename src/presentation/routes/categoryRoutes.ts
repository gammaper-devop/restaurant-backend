import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Category } from '../../domain/entities/Category';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categoryRepository = getRepository(Category);
    const categories = await categoryRepository.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

// POST /api/categories - Create a new category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const categoryRepository = getRepository(Category);
    const category = categoryRepository.create(req.body);
    await categoryRepository.save(category);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
});

export default router;
