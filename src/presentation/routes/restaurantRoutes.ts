import { Router } from 'express';
import { RestaurantController } from '../controllers/RestaurantController';
import { RestaurantLocationController } from '../controllers/RestaurantLocationController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       required:
 *         - name
 *         - category
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the restaurant
 *         name:
 *           type: string
 *           description: The restaurant's name
 *         logo:
 *           type: string
 *           description: URL to the restaurant's logo
 *         phone:
 *           type: string
 *           description: Restaurant's phone number
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         locations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RestaurantLocation'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the restaurant was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the restaurant was last updated
 *     RestaurantLocation:
 *       type: object
 *       required:
 *         - address
 *         - latitude
 *         - longitude
 *         - district
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the location
 *         address:
 *           type: string
 *           description: The location's address
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitude coordinate
 *         district:
 *           $ref: '#/components/schemas/District'
 *         restaurant:
 *           $ref: '#/components/schemas/Restaurant'
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the category
 *         name:
 *           type: string
 *           description: The category's name
 *     District:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the district
 *         name:
 *           type: string
 *           description: The district's name
 *         province:
 *           $ref: '#/components/schemas/Province'
 *     Province:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the province
 *         name:
 *           type: string
 *           description: The province's name
 *         city:
 *           $ref: '#/components/schemas/City'
 *     City:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the city
 *         name:
 *           type: string
 *           description: The city's name
 *         country:
 *           $ref: '#/components/schemas/Country'
 *     Country:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the country
 *         name:
 *           type: string
 *           description: The country's name
 */

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     responses:
 *       200:
 *         description: List of all restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 *       500:
 *         description: Server error
 */
router.get('/', RestaurantController.getAll);

/**
 * @swagger
 * /api/restaurants/nearby:
 *   get:
 *     summary: Get nearby restaurants
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude coordinate
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: List of nearby restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Bad request - missing coordinates
 *       500:
 *         description: Server error
 */
router.get('/nearby', RestaurantController.getNearby);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
router.get('/:id', RestaurantController.getById);

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Restaurant name
 *               logo:
 *                 type: string
 *                 description: Restaurant logo URL
 *               phone:
 *                 type: string
 *                 description: Restaurant phone number
 *               category:
 *                 type: integer
 *                 description: Category ID
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, RestaurantController.create);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Restaurant name
 *               logo:
 *                 type: string
 *                 description: Restaurant logo URL
 *               phone:
 *                 type: string
 *                 description: Restaurant phone number
 *               category:
 *                 type: integer
 *                 description: Category ID
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, RestaurantController.update);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       204:
 *         description: Restaurant deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, RestaurantController.delete);

/**
 * @swagger
 * /api/restaurants/locations:
 *   get:
 *     summary: Get all restaurant locations
 *     tags: [Restaurant Locations]
 *     responses:
 *       200:
 *         description: List of all restaurant locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantLocation'
 *       500:
 *         description: Server error
 */
router.get('/locations', RestaurantLocationController.getAll);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/locations:
 *   get:
 *     summary: Get locations for a specific restaurant
 *     tags: [Restaurant Locations]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of restaurant locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RestaurantLocation'
 *       500:
 *         description: Server error
 */
router.get('/:restaurantId/locations', RestaurantLocationController.getByRestaurantId);

/**
 * @swagger
 * /api/restaurants/locations/{id}:
 *   get:
 *     summary: Get restaurant location by ID
 *     tags: [Restaurant Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Restaurant location data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantLocation'
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.get('/locations/:id', RestaurantLocationController.getById);

/**
 * @swagger
 * /api/restaurants/locations:
 *   post:
 *     summary: Create a new restaurant location
 *     tags: [Restaurant Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - latitude
 *               - longitude
 *               - district
 *               - restaurant
 *             properties:
 *               address:
 *                 type: string
 *                 description: Location address
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude coordinate
 *               district:
 *                 type: integer
 *                 description: District ID
 *               restaurant:
 *                 type: integer
 *                 description: Restaurant ID
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantLocation'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/locations', authenticateToken, RestaurantLocationController.create);

/**
 * @swagger
 * /api/restaurants/locations/{id}:
 *   put:
 *     summary: Update restaurant location
 *     tags: [Restaurant Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: Location address
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude coordinate
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude coordinate
 *               district:
 *                 type: integer
 *                 description: District ID
 *               restaurant:
 *                 type: integer
 *                 description: Restaurant ID
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantLocation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.put('/locations/:id', authenticateToken, RestaurantLocationController.update);

/**
 * @swagger
 * /api/restaurants/locations/{id}:
 *   delete:
 *     summary: Delete restaurant location
 *     tags: [Restaurant Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     responses:
 *       204:
 *         description: Location deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.delete('/locations/:id', authenticateToken, RestaurantLocationController.delete);

export default router;
