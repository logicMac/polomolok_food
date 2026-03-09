import { Request, Response } from 'express';
import Food from '../models/Food';
import { AuthRequest } from '../types';
import { deleteImage } from '../config/multer';

export const getAllFoods = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, available } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';

    const foods = await Food.find(filter).sort({ createdAt: -1 });

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
    const { name, description, category, price, available } = req.body;
    
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
      price,
      available: available === 'true' || available === true,
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
    const { name, description, category, price, available } = req.body;

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
    if (price) food.price = price;
    if (available !== undefined) food.available = available === 'true' || available === true;

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
