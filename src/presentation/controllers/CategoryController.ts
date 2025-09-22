import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Category } from '../../domain/entities/Category';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import { ResponseHandler } from '../../shared/responses/ApiResponse';
import { EntityUtils } from '../../shared/utils/EntityUtils';

export class CategoryController {
  // Get all active categories
  static async getAll(req: Request, res: Response) {
    try {
      const categoryRepository = getRepository(Category);
      const categories = await EntityUtils.findActiveEntities(categoryRepository);
      
      const response = ResponseHandler.success(categories, 'Categories retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Get category by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Category ID is required');
      }

      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        throw new BadRequestError('Invalid category ID format');
      }

      const categoryRepository = getRepository(Category);
      const category = await EntityUtils.findOneActiveEntity(categoryRepository, {
        where: { id: categoryId },
        relations: ['restaurants']
      });

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      const response = ResponseHandler.success(category, 'Category retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Create new category
  static async create(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        throw new BadRequestError('Category name is required');
      }

      const categoryRepository = getRepository(Category);
      
      // Check if category with same name already exists
      const existingCategory = await EntityUtils.findOneActiveEntity(categoryRepository, {
        where: { name }
      });

      if (existingCategory) {
        throw new BadRequestError('Category with this name already exists');
      }

      const category = categoryRepository.create({ name });
      const savedCategory = await categoryRepository.save(category);

      const response = ResponseHandler.success(savedCategory, 'Category created successfully', 201);
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Update category
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Category ID is required');
      }

      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        throw new BadRequestError('Invalid category ID format');
      }

      const categoryRepository = getRepository(Category);
      
      // Check if category exists and is active
      const existsAndActive = await EntityUtils.existsAndIsActive(categoryRepository, categoryId);
      if (!existsAndActive) {
        throw new NotFoundError('Category not found or inactive');
      }

      await categoryRepository.update(categoryId, req.body);
      const updatedCategory = await EntityUtils.findOneActiveEntity(categoryRepository, {
        where: { id: categoryId }
      });

      const response = ResponseHandler.success(updatedCategory, 'Category updated successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }

  // Soft delete category
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('Category ID is required');
      }

      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        throw new BadRequestError('Invalid category ID format');
      }

      const categoryRepository = getRepository(Category);
      
      // Check if category exists and is active
      const existsAndActive = await EntityUtils.existsAndIsActive(categoryRepository, categoryId);
      if (!existsAndActive) {
        throw new NotFoundError('Category not found or already inactive');
      }

      // Perform soft delete
      const deleted = await EntityUtils.softDelete(categoryRepository, categoryId);
      if (!deleted) {
        throw new BadRequestError('Failed to delete category');
      }

      const response = ResponseHandler.success(null, 'Category deleted successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  }
}