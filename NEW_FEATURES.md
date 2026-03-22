# New Features Added

## 1. Advanced Search & Filters

### Backend Changes
- **Food Model** (`backend/src/models/Food.ts`):
  - Added `cuisine` field (e.g., Filipino, Chinese, Japanese)
  - Added `dietaryTags` array (vegetarian, vegan, gluten-free, dairy-free, halal, spicy)
  - Added `ingredients` array for searchable ingredients
  - Added `preparationTime` field (in minutes)

- **Food Controller** (`backend/src/controllers/foodController.ts`):
  - Enhanced `getAllFoods` with advanced filtering:
    - Search by name, description, or ingredients
    - Filter by cuisine type
    - Filter by dietary tags
    - Price range filtering (minPrice, maxPrice)
    - Preparation time filtering (maxPrepTime)
    - Sorting options (by price, name, prep time, date)
    - Sort order (ascending/descending)

### Frontend Changes
- **FoodFilters Component** (`client/src/components/FoodFilters.tsx`):
  - Search bar with real-time filtering
  - Category dropdown
  - Cuisine dropdown
  - Dietary preference tags (clickable pills)
  - Price range inputs
  - Max preparation time filter
  - Sort by and order options
  - Clear filters button
  - Collapsible advanced filters

- **Home Page** (`client/src/pages/Home.tsx`):
  - Integrated FoodFilters component
  - Server-side filtering (API calls with query params)
  - Removed client-side filtering for better performance

### Usage
```typescript
// API Example
GET /api/foods?search=chicken&category=Main Course&cuisine=Filipino&dietaryTags=halal,spicy&minPrice=100&maxPrice=500&maxPrepTime=45&sortBy=price&sortOrder=asc
```

---

## 2. Real-time Order Tracking

### Backend Changes
- **Order Model** (`backend/src/models/Order.ts`):
  - Added `out-for-delivery` status
  - Added `estimatedDeliveryTime` field
  - Added `driverLocation` object (latitude, longitude, lastUpdated)
  - Added `statusHistory` array to track status changes with timestamps and notes

- **Socket.IO Configuration** (`backend/src/config/socket.ts`):
  - WebSocket server initialization
  - Authentication middleware for socket connections
  - Room-based communication (user rooms, order rooms, admin room)
  - Real-time events:
    - `order-update`: Broadcast order status changes
    - `driver-location`: Update driver's real-time location
    - `join-order`: Join order-specific room
    - `leave-order`: Leave order room

- **Order Controller** (`backend/src/controllers/orderController.ts`):
  - New `updateOrderTracking` endpoint for admins
  - New `getOrderTracking` endpoint for users
  - Socket emission on status updates
  - Driver location updates

- **Server** (`backend/server.ts`):
  - Integrated Socket.IO with Express server
  - HTTP server creation for Socket.IO

### Frontend Changes
- **SocketContext** (`client/src/context/SocketContext.tsx`):
  - Socket.IO client connection management
  - Authentication with JWT token
  - Connection status tracking
  - Auto-reconnection

- **OrderTracking Component** (`client/src/components/OrderTracking.tsx`):
  - Visual status timeline with icons
  - Real-time status updates via WebSocket
  - Interactive map showing:
    - Delivery location marker
    - Driver location marker (if available)
    - Route line between driver and destination
  - Estimated delivery time countdown
  - Status history with timestamps
  - Cancelled order handling

- **Orders Page** (`client/src/pages/Orders.tsx`):
  - "Track Order" button for active orders
  - Real-time order updates
  - Integration with OrderTracking component

### Usage
```typescript
// Admin updates order tracking
PUT /api/orders/:id/tracking
{
  "status": "out-for-delivery",
  "driverLocation": {
    "latitude": 6.2167,
    "longitude": 125.1167
  },
  "estimatedDeliveryTime": "2024-03-22T14:30:00Z",
  "note": "Driver is on the way"
}

// User gets tracking info
GET /api/orders/:id/tracking
```

---

## 3. Chat Support

### Backend Changes
- **ChatMessage Model** (`backend/src/models/ChatMessage.ts`):
  - User ID and name
  - Message content
  - Sender type (user, admin, system)
  - Order ID (optional, for order-specific chats)
  - Read status
  - Timestamps

- **Chat Controller** (`backend/src/controllers/chatController.ts`):
  - `sendMessage`: Create new chat message
  - `getMessages`: Retrieve chat history (filtered by order or user)
  - `markAsRead`: Mark messages as read
  - `getUnreadCount`: Get unread message count

- **Chat Routes** (`backend/src/routes/chatRoutes.ts`):
  - POST `/api/chat/messages` - Send message
  - GET `/api/chat/messages` - Get messages
  - PUT `/api/chat/messages/read` - Mark as read
  - GET `/api/chat/messages/unread-count` - Get unread count

- **Socket.IO** (`backend/src/config/socket.ts`):
  - `chat-message` event for real-time messaging
  - `new-message` event broadcast
  - Room-based chat (order-specific or general support)

### Frontend Changes
- **ChatSupport Component** (`client/src/components/ChatSupport.tsx`):
  - Floating chat button with unread badge
  - Collapsible chat window
  - Minimize functionality
  - Real-time message updates via WebSocket
  - Message history loading
  - Send message form
  - Connection status indicator
  - Order-specific chat support
  - Auto-scroll to latest message
  - User/admin message differentiation

- **Integration**:
  - Added to Home page (general support)
  - Added to Orders page (order-specific support)
  - Added to OrderTracking view

### Usage
```typescript
// Send a message
POST /api/chat/messages
{
  "message": "When will my order arrive?",
  "orderId": "65f1a2b3c4d5e6f7g8h9i0j1" // optional
}

// Get messages for an order
GET /api/chat/messages?orderId=65f1a2b3c4d5e6f7g8h9i0j1

// Real-time via Socket.IO
socket.emit('chat-message', {
  message: 'Hello!',
  orderId: '65f1a2b3c4d5e6f7g8h9i0j1'
});

socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

---

## Installation & Setup

### Backend Dependencies
```bash
cd backend
npm install socket.io @types/socket.io
```

### Frontend Dependencies
```bash
cd client
npm install socket.io-client
```

### Environment Variables
No new environment variables required. Uses existing `CLIENT_URL` and `JWT_SECRET`.

---

## Testing the Features

### 1. Test Advanced Search
1. Go to home page
2. Click "Filters" button
3. Try different combinations:
   - Search for "chicken"
   - Select "Main Course" category
   - Choose dietary tags like "halal" or "spicy"
   - Set price range
   - Sort by price

### 2. Test Order Tracking
1. Place an order as a customer
2. Go to "My Orders"
3. Click "Track Order" on an active order
4. See the status timeline
5. As admin, update order status and driver location
6. Watch real-time updates on customer's screen

### 3. Test Chat Support
1. Click the chat button (bottom right)
2. Send a message
3. As admin, reply to the message
4. See real-time message delivery
5. Test order-specific chat from order tracking page

---

## Admin Features

### Update Order Tracking (Admin Only)
```bash
# Update order status and driver location
curl -X PUT http://localhost:5000/api/orders/:orderId/tracking \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "out-for-delivery",
    "driverLocation": {
      "latitude": 6.2167,
      "longitude": 125.1167
    },
    "estimatedDeliveryTime": "2024-03-22T14:30:00Z"
  }'
```

### Respond to Chat Messages
1. Login as admin
2. Open chat support
3. See all user messages
4. Reply to customers
5. Messages are delivered in real-time

---

## Technical Notes

- Socket.IO uses JWT authentication
- All real-time features require user authentication
- Chat messages are persisted in MongoDB
- Order tracking updates are broadcast to relevant users only
- Maps use OpenStreetMap (free, no API key required)
- Leaflet library for interactive maps
- Responsive design for mobile devices
