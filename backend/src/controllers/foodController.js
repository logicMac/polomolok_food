"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFood = exports.updateFood = exports.createFood = exports.getFoodById = exports.getAllFoods = void 0;
const Food_1 = __importDefault(require("../models/Food"));
const multer_1 = require("../config/multer");
const getAllFoods = async (req, res) => {
    try {
        const { category, available, search, cuisine, dietaryTags, minPrice, maxPrice, maxPrepTime, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = {};
        // Basic filters
        if (category)
            filter.category = category;
        if (available !== undefined)
            filter.available = available === 'true';
        if (cuisine)
            filter.cuisine = new RegExp(cuisine, 'i');
        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        // Preparation time filter
        if (maxPrepTime) {
            filter.preparationTime = { $lte: Number(maxPrepTime) };
        }
        // Dietary tags filter
        if (dietaryTags) {
            const tags = dietaryTags.split(',');
            filter.dietaryTags = { $in: tags };
        }
        // Search filter (name, description, ingredients)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { ingredients: searchRegex }
            ];
        }
        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const foods = await Food_1.default.find(filter).sort(sortOptions);
        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch foods',
            error: error.message
        });
    }
};
exports.getAllFoods = getAllFoods;
const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food_1.default.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch food',
            error: error.message
        });
    }
};
exports.getFoodById = getFoodById;
const createFood = async (req, res) => {
    try {
        const { name, description, category, cuisine, dietaryTags, ingredients, price, preparationTime, available } = req.body;
        // Check if image was uploaded
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Food image is required'
            });
            return;
        }
        const food = await Food_1.default.create({
            name,
            description,
            category,
            cuisine,
            dietaryTags: dietaryTags ? JSON.parse(dietaryTags) : [],
            ingredients: ingredients ? JSON.parse(ingredients) : [],
            price,
            preparationTime: preparationTime || 30,
            available: available === 'true' || available === true,
            image: `/uploads/${req.file.filename}`
        });
        res.status(201).json({
            success: true,
            message: 'Food item created successfully',
            data: food
        });
    }
    catch (error) {
        // Delete uploaded file if food creation fails
        if (req.file) {
            (0, multer_1.deleteImage)(`/uploads/${req.file.filename}`);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create food item',
            error: error.message
        });
    }
};
exports.createFood = createFood;
const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, cuisine, dietaryTags, ingredients, price, preparationTime, available } = req.body;
        const food = await Food_1.default.findById(id);
        if (!food) {
            res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
            return;
        }
        // Update fields
        if (name)
            food.name = name;
        if (description)
            food.description = description;
        if (category)
            food.category = category;
        if (cuisine)
            food.cuisine = cuisine;
        if (dietaryTags)
            food.dietaryTags = JSON.parse(dietaryTags);
        if (ingredients)
            food.ingredients = JSON.parse(ingredients);
        if (price)
            food.price = price;
        if (preparationTime)
            food.preparationTime = preparationTime;
        if (available !== undefined)
            food.available = available === 'true' || available === true;
        // Update image if new one is uploaded
        if (req.file) {
            // Delete old image
            (0, multer_1.deleteImage)(food.image);
            food.image = `/uploads/${req.file.filename}`;
        }
        await food.save();
        res.status(200).json({
            success: true,
            message: 'Food item updated successfully',
            data: food
        });
    }
    catch (error) {
        // Delete uploaded file if update fails
        if (req.file) {
            (0, multer_1.deleteImage)(`/uploads/${req.file.filename}`);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update food item',
            error: error.message
        });
    }
};
exports.updateFood = updateFood;
const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food_1.default.findById(id);
        if (!food) {
            res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
            return;
        }
        // Delete image file
        (0, multer_1.deleteImage)(food.image);
        // Delete food from database
        await Food_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Food item deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete food item',
            error: error.message
        });
    }
};
exports.deleteFood = deleteFood;
//# sourceMappingURL=foodController.js.map