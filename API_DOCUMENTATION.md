# API Documentation

## APIU Cafeteria Operation System REST API

Base URL: `http://localhost:8000/api`

### Authentication

The API uses Laravel Sanctum for authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

### Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": "string (optional)",
  "data": object|array (optional),
  "errors": object (optional, validation errors)
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User
**POST** `/register`

Register a new student account.

**Request Body:**
```json
{
  "student_id": "2024001",
  "name": "John Doe",
  "email": "john@student.apiu.edu",
  "password": "password123",
  "password_confirmation": "password123",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "student_id": "2024001",
      "name": "John Doe",
      "email": "john@student.apiu.edu",
      "role": "student",
      "gender": "male",
      "account_balance": "11000.00",
      "is_active": true
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

### Login
**POST** `/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "john@student.apiu.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "student_id": "2024001",
      "name": "John Doe",
      "email": "john@student.apiu.edu",
      "role": "student",
      "account_balance": "11000.00"
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

### Logout
**POST** `/logout`

Revoke current access token.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Profile
**GET** `/profile`

Get current user profile.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": "2024001",
    "name": "John Doe",
    "email": "john@student.apiu.edu",
    "role": "student",
    "account_balance": "10950.00",
    "last_login_at": "2024-12-15T08:30:00.000000Z"
  }
}
```

---

## Menu Endpoints

### Get Categories
**GET** `/categories`

Get all menu categories with their menu items.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Dishes",
      "description": "Rice, noodles, and main course meals",
      "image": null,
      "is_active": true,
      "sort_order": 1,
      "children": [],
      "menu_items": [
        {
          "id": 1,
          "name": "Pad Thai",
          "price": "45.00",
          "is_available": true
        }
      ]
    }
  ]
}
```

### Get Menu Items
**GET** `/menu`

Get paginated menu items with filtering options.

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `per_page` (int) - Items per page (default: 15)
- `category_id` (int) - Filter by category
- `search` (string) - Search by name
- `featured` (boolean) - Filter featured items
- `sort_by` (string) - Sort field: name, price, created_at
- `sort_order` (string) - Sort direction: asc, desc

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Pad Thai",
        "description": "Traditional Thai stir-fried noodles",
        "price": "45.00",
        "image": null,
        "ingredients": ["rice noodles", "shrimp", "tofu"],
        "allergens": ["shellfish", "eggs", "soy"],
        "category_id": 1,
        "is_available": true,
        "is_featured": true,
        "preparation_time": 15,
        "category": {
          "id": 1,
          "name": "Main Dishes"
        }
      }
    ],
    "last_page": 1,
    "per_page": 15,
    "total": 10
  }
}
```

### Get Menu Item
**GET** `/menu/{id}`

Get specific menu item details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pad Thai",
    "description": "Traditional Thai stir-fried noodles",
    "price": "45.00",
    "ingredients": ["rice noodles", "shrimp", "tofu"],
    "allergens": ["shellfish", "eggs", "soy"],
    "preparation_time": 15,
    "category": {
      "id": 1,
      "name": "Main Dishes"
    }
  }
}
```

---

## Order Endpoints

### Get Orders
**GET** `/orders`

Get user's orders with pagination.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (int) - Page number
- `status` (string) - Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "order_number": "ORD-20241215-0001",
        "total_amount": "95.00",
        "status": "pending",
        "payment_status": "pending",
        "pickup_time": null,
        "special_instructions": null,
        "created_at": "2024-12-15T09:00:00.000000Z",
        "order_items": [
          {
            "id": 1,
            "quantity": 2,
            "unit_price": "45.00",
            "total_price": "90.00",
            "menu_item": {
              "id": 1,
              "name": "Pad Thai"
            }
          }
        ]
      }
    ],
    "total": 5
  }
}
```

### Create Order
**POST** `/orders`

Create a new order.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "special_requests": "Extra spicy"
    },
    {
      "menu_item_id": 3,
      "quantity": 1
    }
  ],
  "pickup_time": "2024-12-15T12:00:00Z",
  "special_instructions": "Please call when ready"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "order_number": "ORD-20241215-0001",
    "total_amount": "95.00",
    "status": "pending",
    "payment_status": "paid",
    "order_items": [...]
  }
}
```

### Get Order
**GET** `/orders/{id}`

Get specific order details.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD-20241215-0001",
    "total_amount": "95.00",
    "status": "confirmed",
    "payment_status": "paid",
    "pickup_time": "2024-12-15T12:00:00.000000Z",
    "confirmed_at": "2024-12-15T09:05:00.000000Z",
    "order_items": [
      {
        "id": 1,
        "quantity": 2,
        "unit_price": "45.00",
        "total_price": "90.00",
        "special_requests": "Extra spicy",
        "menu_item": {
          "id": 1,
          "name": "Pad Thai",
          "preparation_time": 15
        }
      }
    ]
  }
}
```

### Confirm Order
**POST** `/orders/{id}/confirm`

Confirm order payment (Staff/Admin only).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Order confirmed successfully",
  "data": {
    "id": 1,
    "status": "confirmed",
    "payment_status": "paid",
    "confirmed_at": "2024-12-15T09:05:00.000000Z"
  }
}
```

### Cancel Order
**POST** `/orders/{id}/cancel`

Cancel an order (if status allows).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

### Mark Order as Picked Up
**POST** `/orders/{id}/pickup`

Mark order as picked up.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "pickup_person_name": "John Doe",
  "pickup_person_id": "2024001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order marked as completed",
  "data": {
    "id": 1,
    "status": "completed",
    "completed_at": "2024-12-15T12:30:00.000000Z"
  }
}
```

---

## Admin/Staff Endpoints

### Create Menu Item
**POST** `/menu`

Create a new menu item (Admin/Staff only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Green Curry Rice",
  "description": "Spicy green curry with chicken",
  "price": 50.00,
  "category_id": 1,
  "ingredients": ["chicken", "green curry paste", "coconut milk"],
  "allergens": [],
  "preparation_time": 20,
  "stock_quantity": 50
}
```

### Update Menu Item
**PUT** `/menu/{id}`

Update menu item (Admin/Staff only).

### Delete Menu Item
**DELETE** `/menu/{id}`

Delete menu item (Admin/Staff only).

### Update Order Status
**PUT** `/orders/{id}/status`

Update order status (Staff/Admin only).

**Request Body:**
```json
{
  "status": "preparing"
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Forbidden - Insufficient permissions"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- General API endpoints: 60 requests per minute per user

---

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for frontend applications.

---

## Demo Accounts

### Student Account
- **Email:** john@student.apiu.edu
- **Password:** password
- **Balance:** ฿11,000

### Staff Account
- **Email:** staff@apiu.edu
- **Password:** password

### Admin Account
- **Email:** admin@apiu.edu
- **Password:** password