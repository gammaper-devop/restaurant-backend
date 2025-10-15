import { Router } from 'express';
import { DishController } from '../controllers/DishController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Dish:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the dish
 *         name:
 *           type: string
 *           description: Name of the dish
 *         description:
 *           type: string
 *           description: Description of the dish
 *         image:
 *           type: string
 *           description: URL or path to dish image
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the dish
 *         restaurant:
 *           $ref: '#/components/schemas/Restaurant'
 *         active:
 *           type: boolean
 *           description: Whether the dish is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateDishRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - restaurant
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         image:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 999999.99
 *         restaurant:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *     UpdateDishRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         image:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 999999.99
 *         restaurant:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 */

/**
 * @swagger
 * /api/dishes:
 *   get:
 *     summary: Get all active dishes
 *     tags: [Dishes]
 *     responses:
 *       200:
 *         description: List of all active dishes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dish'
 *                 message:
 *                   type: string
 */
router.get('/', DishController.getAll);

/**
 * @swagger
 * /api/dishes/{id}:
 *   get:
 *     summary: Get dish by ID
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dish ID
 *     responses:
 *       200:
 *         description: Dish details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *                 message:
 *                   type: string
 *       404:
 *         description: Dish not found
 */
router.get('/:id', DishController.getById);

/**
 * @swagger
 * /api/dishes/restaurant/{restaurantId}:
 *   get:
 *     summary: Get dishes by restaurant
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of dishes for the restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dish'
 *                 message:
 *                   type: string
 *       404:
 *         description: Restaurant not found
 */
router.get('/restaurant/:restaurantId', DishController.getByRestaurant);

/**
 * @swagger
 * /api/dishes:
 *   post:
 *     summary: Create a new dish (Requires Authentication)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDishRequest'
 *     responses:
 *       201:
 *         description: Dish created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, DishController.create);

/**
 * @swagger
 * /api/dishes/{id}:
 *   put:
 *     summary: Update a dish (Requires Authentication)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dish ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDishRequest'
 *     responses:
 *       200:
 *         description: Dish updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Dish'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dish not found
 */
router.put('/:id', authenticateToken, DishController.update);

/**
 * @swagger
 * /api/dishes/{id}:
 *   delete:
 *     summary: Delete a dish (Soft delete - Requires Authentication)
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dish ID
 *     responses:
 *       200:
 *         description: Dish deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dish not found
 */
router.delete('/:id', authenticateToken, DishController.delete);

export default router;
