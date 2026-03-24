import { Request, Response } from 'express';
import Food from '../models/Food';
import { AuthRequest } from '../types';
import { deleteImage } from '../config/multer';

export const getAllFoods = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      category, 
      available, 
      search, 
      cuisine,
      dietaryTags,
      minPrice,
      maxPrice,
      maxPrepTime,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter: any = {};
    
    // Basic filters
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';
    if (cuisine) filter.cuisine = new RegExp(cuisine as string, 'i');
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Preparation time filter
    if (maxPrepTime) {
      filter.preparationTime = { $lte: Number(maxPrepTime) };
    }
    
    // Dietary tags filter
    if (dietaryTags) {
      const tags = (dietaryTags as string).split(',');
      filter.dietaryTags = { $in: tags };
    }
    
    // Search filter (name, description, ingredients)
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { ingredients: searchRegex }
      ];
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const foods = await Food.find(filter).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch foods',
      error: error.message
    });
  }
};

export const getFoodById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const food = await Food.findById(id);

    if (!food) {
      res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: food
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch food',
      error: error.message
    });
  }
};

export const createFood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      description, 
      category, 
      cuisine,
      dietaryTags,
      ingredients,
      price, 
      preparationTime,
      available,
      trackInventory,
      stock,
      lowStockThreshold
    } = req.body;
    
    // Check if image was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Food image is required'
      });
      return;
    }

    const food = await Food.create({
      name,
      description,
      category,
      cuisine,
      dietaryTags: dietaryTags ? JSON.parse(dietaryTags) : [],
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      price,
      preparationTime: preparationTime || 30,
      available: available === 'true' || available === true,
      trackInventory: trackInventory === 'true' || trackInventory === true,
      stock: stock ? Number(stock) : 0,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 10,
      image: `/uploads/${req.file.filename}`
    });

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: food
    });
  } catch (error: any) {
    // Delete uploaded file if food creation fails
    if (req.file) {
      deleteImage(`/uploads/${req.file.filename}`);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create food item',
      error: error.message
    });
  }
};

export const updateFood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      category, 
      cuisine,
      dietaryTags,
      ingredients,
      price, 
      preparationTime,
      available,
      trackInventory,
      stock,
      lowStockThreshold
    } = req.body;

    const food = await Food.findById(id);
    if (!food) {
      res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
      return;
    }

    // Update fields
    if (name) food.name = name;
    if (description) food.description = description;
    if (category) food.category = category;
    if (cuisine) food.cuisine = cuisine;
    if (dietaryTags) food.dietaryTags = JSON.parse(dietaryTags);
    if (ingredients) food.ingredients = JSON.parse(ingredients);
    if (price) food.price = price;
    if (preparationTime) food.preparationTime = preparationTime;
    if (available !== undefined) food.available = available === 'true' || available === true;
    if (trackInventory !== undefined) food.trackInventory = trackInventory === 'true' || trackInventory === true;
    if (stock !== undefined) food.stock = Number(stock);
    if (lowStockThreshold !== undefined) food.lowStockThreshold = Number(lowStockThreshold);

    // Update image if new one is uploaded
    if (req.file) {
      // Delete old image
      deleteImage(food.image);
      food.image = `/uploads/${req.file.filename}`;
    }

    await food.save();

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      data: food
    });
  } catch (error: any) {
    // Delete uploaded file if update fails
    if (req.file) {
      deleteImage(`/uploads/${req.file.filename}`);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update food item',
      error: error.message
    });
  }
};

export const deleteFood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const food = await Food.findById(id);
    if (!food) {
      res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
      return;
    }

    // Delete image file
    deleteImage(food.image);

    // Delete food from database
    await Food.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete food item',
      error: error.message
    });
  }
};
