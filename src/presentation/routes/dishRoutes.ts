import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Dish } from '../../domain/entities/Dish';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// GET /api/dishes - Get all dishes
router.get('/', async (req, res) => {
  try {
    const dishRepository = getRepository(Dish);
    const dishes = await dishRepository.find({ relations: ['restaurant'] });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dishes', error });
  }
});

// POST /api/dishes - Create a new dish
router.post('/', authenticateToken, async (req, res) => {
  try {
    const dishRepository = getRepository(Dish);
    const dish = dishRepository.create(req.body);
    await dishRepository.save(dish);
    res.status(201).json(dish);
  } catch (error) {
    res.status(500).json({ message: 'Error creating dish', error });
  }
});

export default router;
