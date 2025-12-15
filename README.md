# APIU Cafeteria Operation System

A modern web application for managing cafeteria operations at Asia-Pacific International University, built with Laravel 12 (Backend) and React 18 (Frontend).

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: Role-based access control (Admin, Staff, Student)
- **Digital Menu System**: Real-time menu display with categories, prices, and ingredients
- **Online Ordering**: Students can place orders online with pickup scheduling
- **Account-based Payment**: Direct debit from student accounts with balance tracking
- **Order Management**: Complete order lifecycle from placement to pickup
- **Trusted Friends System**: Allow friends to pickup orders on behalf of students

### Advanced Features
- **Real-time Updates**: Live order status updates
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Activity Logging**: Complete audit trail of user actions
- **Search & Filtering**: Advanced menu search and filtering options
- **Allergen Information**: Clear ingredient and allergen labeling
- **Pickup Management**: NFC-based pickup verification system

## 🏗️ Architecture

### Backend (Laravel 12)
- **RESTful API** with proper HTTP status codes
- **Laravel Sanctum** for API authentication
- **Resource Classes** for consistent JSON responses
- **Form Requests** for validation
- **Middleware** for role-based access control
- **Database Migrations** with proper relationships
- **Seeders** for sample data

### Frontend (React 18)
- **Single Page Application** with React Router
- **Redux Toolkit** for state management
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

## 📊 Database Schema

### Core Tables
1. **users** - Student, staff, and admin accounts
2. **categories** - Menu categories with hierarchical structure
3. **menu_items** - Food items with pricing and ingredients
4. **orders** - Order records with status tracking
5. **order_items** - Individual items within orders
6. **trusted_friends** - Friend pickup permissions
7. **activity_logs** - User activity audit trail

### Relationships
- **1-to-many**: User → Orders, Category → MenuItems, Order → OrderItems
- **Many-to-many**: Users ↔ TrustedFriends (self-referencing)
- **Self-referencing**: Categories (parent-child hierarchy)

## 🛠️ Installation & Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd cafeteria-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### Frontend Setup
```bash
cd cafeteria-frontend
npm install
npm run dev
```

## 🔐 User Roles & Permissions

### Student
- View menu and place orders
- Manage account balance
- View order history
- Add trusted friends for pickup
- Update profile information

### Staff
- Manage menu items
- Update order status
- View all orders
- Process pickups

### Admin
- Full system access
- User management
- System configuration
- Analytics and reports

## 📱 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Menu
- `GET /api/categories` - Get menu categories
- `GET /api/menu` - Get menu items (with filtering)
- `GET /api/menu/{id}` - Get specific menu item

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `POST /api/orders/{id}/confirm` - Confirm order
- `POST /api/orders/{id}/cancel` - Cancel order
- `POST /api/orders/{id}/pickup` - Mark as picked up

## 🎯 Business Rules

1. **Account Balance**: Students cannot order if insufficient balance
2. **Order Status**: Orders follow strict status progression
3. **Pickup Authorization**: Only authorized persons can pickup orders
4. **Semester Balance**: Remaining balance carries over, deficits are tracked
5. **Menu Availability**: Items can be marked unavailable or out of stock

## 🧪 Demo Accounts

### Student Account
- **Email**: john@student.apiu.edu
- **Password**: password
- **Balance**: ฿11,000 (Male student)

### Staff Account
- **Email**: staff@apiu.edu
- **Password**: password

### Admin Account
- **Email**: admin@apiu.edu
- **Password**: password

## 🚀 Deployment

The application is designed to be deployed with:
- **Backend**: Laravel on any PHP hosting service
- **Frontend**: React build served via CDN or static hosting
- **Database**: MySQL/PostgreSQL for production

## 📈 Future Enhancements

- **PWA Support**: Offline functionality
- **Push Notifications**: Real-time order updates
- **Payment Integration**: Credit card and mobile payment options
- **Analytics Dashboard**: Advanced reporting and insights
- **Multi-language Support**: Thai and English interface
- **Mobile App**: Native iOS and Android applications

## 👥 Team

**Developer**: Niu Boen  
**Course**: IT 341/IT367 Web Applications Development  
**Institution**: Asia-Pacific International University

## 📄 License

This project is developed for educational purposes as part of the Web Applications Development course final project.