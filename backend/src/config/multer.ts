import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Use UUID to prevent path traversal and filename conflicts
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    // Only use extension, ignore original filename completely
    const sanitizedFilename = `${uniqueId}${ext}`;
    cb(null, sanitizedFilename);
  }
});

// File filter - only allow images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only 1 file per request
  }
});

// Helper function to delete old image
export const deleteImage = (imagePath: string): void => {
  if (imagePath && imagePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};
