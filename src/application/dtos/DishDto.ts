export interface CreateDishDto {
  name: string;
  description?: string;
  image?: string;
  price: number;
  restaurant: {
    id: number;
  };
}

export interface UpdateDishDto {
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  restaurant?: {
    id: number;
  };
}

export interface DishResponseDto {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  restaurant: {
    id: number;
    name: string;
  };
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class DishValidator {
  static validateCreateDish(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    if (data.description && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Price is required and must be a positive decimal number');
    }

    if (data.price && data.price > 999999.99) {
      errors.push('Price must be less than 999999.99');
    }

    // Validar que tenga máximo 2 decimales
    if (data.price && !Number.isInteger(data.price * 100)) {
      errors.push('Price must have at most 2 decimal places');
    }

    if (!data.restaurant || !data.restaurant.id || typeof data.restaurant.id !== 'number') {
      errors.push('Restaurant ID is required and must be a number');
    }

    if (data.image && typeof data.image !== 'string') {
      errors.push('Image must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdateDish(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Name must be a non-empty string');
      }
      if (data.name && data.name.length > 100) {
        errors.push('Name must be less than 100 characters');
      }
    }

    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      }
      if (data.description && data.description.length > 500) {
        errors.push('Description must be less than 500 characters');
      }
    }

    if (data.price !== undefined) {
      if (typeof data.price !== 'number' || data.price <= 0) {
        errors.push('Price must be a positive decimal number');
      }
      if (data.price && data.price > 999999.99) {
        errors.push('Price must be less than 999999.99');
      }
      // Validar que tenga máximo 2 decimales
      if (data.price && !Number.isInteger(data.price * 100)) {
        errors.push('Price must have at most 2 decimal places');
      }
    }

    if (data.restaurant !== undefined) {
      if (!data.restaurant || !data.restaurant.id || typeof data.restaurant.id !== 'number') {
        errors.push('Restaurant ID must be a number');
      }
    }

    if (data.image !== undefined && data.image !== null) {
      if (typeof data.image !== 'string') {
        errors.push('Image must be a string');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}