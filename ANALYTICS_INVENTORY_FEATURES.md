# Analytics Dashboard & Inventory Management Features

## Overview
Added comprehensive analytics dashboard and inventory management system to the Polomolok Food Ordering platform.

## Features Added

### 1. Analytics Dashboard (`/admin/analytics`)

#### Revenue Analytics
- Total revenue tracking
- Average order value
- Order count statistics
- Revenue by day chart
- Customizable time periods (24h, 7d, 30d, 90d)

#### Order Analytics
- Orders by status breakdown
- Peak hours analysis
- Order trends over time

#### Customer Analytics
- Total customer count
- New customer tracking
- Customer growth metrics

#### Top Selling Foods
- Ranked list of best-selling items
- Quantity sold per item
- Revenue generated per item
- Visual display with food images

### 2. Inventory Management

#### Stock Tracking
- Stock quantity per food item
- Low stock threshold alerts
- Automatic availability management
- Track inventory toggle (optional per item)

#### Inventory Dashboard
- Low stock items alert
- Out of stock items list
- Stock by category breakdown
- Visual indicators for stock levels

#### Food Management Updates
- Added stock quantity field
- Added low stock threshold field
- Added track inventory toggle
- Automatic stock monitoring

## Technical Implementation

### Backend

#### New Files
- `backend/src/controllers/analyticsController.ts` - Analytics and inventory endpoints
- `backend/src/routes/analyticsRoutes.ts` - Analytics routes

#### Updated Files
- `backend/src/models/Food.ts` - Added inventory fields (stock, lowStockThreshold, trackInventory)
- `backend/src/types/index.ts` - Updated IFood interface
- `backend/src/controllers/foodController.ts` - Added inventory field handling
- `backend/server.ts` - Added analytics routes

#### API Endpoints
- `GET /api/analytics/dashboard?period=7d` - Get dashboard statistics
- `GET /api/analytics/inventory` - Get inventory statistics

### Frontend

#### New Files
- `client/src/pages/AdminAnalytics.tsx` - Analytics dashboard page

#### Updated Files
- `client/src/pages/AdminFoods.tsx` - Added inventory management fields
- `client/src/pages/AdminDashboard.tsx` - Added analytics link
- `client/src/App.jsx` - Added analytics route
- `client/src/types/index.ts` - Updated Food interface
- `client/src/components/FoodCard.tsx` - Fixed image URL handling

## Database Schema Changes

### Food Model
```typescript
{
  // ... existing fields
  stock: Number (default: 0)
  lowStockThreshold: Number (default: 10)
  trackInventory: Boolean (default: false)
}
```

## Image Display Fix

### Issue
Images were not displaying in production because URLs were hardcoded to `localhost:5000`.

### Solution
- Created `getImageUrl()` helper function
- Uses environment variable `VITE_API_URL`
- Properly constructs URLs for both development and production
- Added fallback placeholder for missing images
- Applied fix to both AdminFoods and FoodCard components

## Usage

### For Admins

#### Accessing Analytics
1. Login as admin
2. Go to Admin Dashboard
3. Click "Analytics & Inventory"
4. Select time period from dropdown
5. Switch between Analytics and Inventory tabs

#### Managing Inventory
1. Go to Admin > Manage Foods
2. When adding/editing a food item:
   - Check "Track Inventory" to enable stock tracking
   - Set "Stock Quantity" (current available stock)
   - Set "Low Stock Threshold" (alert level)
3. View inventory alerts in Analytics > Inventory tab

#### Monitoring Stock
- Low stock items show yellow alert
- Out of stock items show red alert
- Stock by category provides overview
- Automatic alerts when stock falls below threshold

## Benefits

1. **Data-Driven Decisions**: Make informed business decisions based on real sales data
2. **Inventory Control**: Prevent stockouts and overstocking
3. **Revenue Tracking**: Monitor business performance over time
4. **Customer Insights**: Understand customer behavior and preferences
5. **Operational Efficiency**: Identify peak hours for better staffing
6. **Product Performance**: Know which items are popular and profitable

## Future Enhancements

Potential additions:
- Automatic stock deduction on order completion
- Stock reorder notifications
- Supplier management
- Predictive analytics
- Export reports to PDF/Excel
- Email alerts for low stock
- Profit margin analysis
- Customer lifetime value tracking
