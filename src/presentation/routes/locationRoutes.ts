import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Country } from '../../domain/entities/Country';
import { City } from '../../domain/entities/City';
import { ProvinceController } from '../controllers/ProvinceController';
import { DistrictController } from '../controllers/DistrictController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Countries
// GET /api/locations/countries - Get all countries
router.get('/countries', async (req, res) => {
  try {
    const countryRepository = getRepository(Country);
    const countries = await countryRepository.find();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching countries', error });
  }
});

// POST /api/locations/countries - Create a new country
router.post('/countries', authenticateToken, async (req, res) => {
  try {
    const countryRepository = getRepository(Country);
    const country = countryRepository.create(req.body);
    await countryRepository.save(country);
    res.status(201).json(country);
  } catch (error) {
    res.status(500).json({ message: 'Error creating country', error });
  }
});

// Cities
// GET /api/locations/cities - Get all cities
router.get('/cities', async (req, res) => {
  try {
    const cityRepository = getRepository(City);
    const cities = await cityRepository.find({ relations: ['country'] });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cities', error });
  }
});

// GET /api/locations/cities/:countryId - Get cities by country (for cascading selection)
router.get('/cities/country/:countryId', async (req, res) => {
  try {
    const { countryId } = req.params;
    if (!countryId) return res.status(400).json({ message: 'Country ID is required' });
    const cityRepository = getRepository(City);
    const cities = await cityRepository.find({
      where: { country: { id: parseInt(countryId) } },
      relations: ['country']
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cities by country', error });
  }
});

// POST /api/locations/cities - Create a new city
router.post('/cities', authenticateToken, async (req, res) => {
  try {
    const cityRepository = getRepository(City);
    const city = cityRepository.create(req.body);
    await cityRepository.save(city);
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ message: 'Error creating city', error });
  }
});

// Provinces
// GET /api/locations/provinces - Get all provinces
router.get('/provinces', ProvinceController.getAll);

// GET /api/locations/provinces/:id - Get province by ID
router.get('/provinces/:id', ProvinceController.getById);

// GET /api/locations/provinces/city/:cityId - Get provinces by city (for cascading selection)
router.get('/provinces/city/:cityId', ProvinceController.getByCityId);

// POST /api/locations/provinces - Create a new province
router.post('/provinces', authenticateToken, ProvinceController.create);

// PUT /api/locations/provinces/:id - Update province
router.put('/provinces/:id', authenticateToken, ProvinceController.update);

// DELETE /api/locations/provinces/:id - Delete province
router.delete('/provinces/:id', authenticateToken, ProvinceController.delete);

// Districts
// GET /api/locations/districts - Get all districts
router.get('/districts', DistrictController.getAll);

// GET /api/locations/districts/:id - Get district by ID
router.get('/districts/:id', DistrictController.getById);

// GET /api/locations/districts/province/:provinceId - Get districts by province (for cascading selection)
router.get('/districts/province/:provinceId', DistrictController.getByProvinceId);

// POST /api/locations/districts - Create a new district
router.post('/districts', authenticateToken, DistrictController.create);

// PUT /api/locations/districts/:id - Update district
router.put('/districts/:id', authenticateToken, DistrictController.update);

// DELETE /api/locations/districts/:id - Delete district
router.delete('/districts/:id', authenticateToken, DistrictController.delete);

export default router;
