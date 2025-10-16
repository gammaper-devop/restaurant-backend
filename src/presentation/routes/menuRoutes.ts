import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Menu } from '../../domain/entities/Menu';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// GET /api/menus - Get all menus
router.get('/', async (req, res) => {
  try {
    const menuRepository = getRepository(Menu);
    const menus = await menuRepository.find({ relations: ['restaurant'] });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menus', error });
  }
});

// POST /api/menus - Create a new menu
router.post('/', authenticateToken, async (req, res) => {
  try {
    const menuRepository = getRepository(Menu);
    const menu = menuRepository.create(req.body);
    await menuRepository.save(menu);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu', error });
  }
});

export default router;
