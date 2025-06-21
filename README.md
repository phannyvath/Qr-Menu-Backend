# 🍽️ QR Menu Backend API

A robust and scalable backend API for restaurant QR menu management systems. This API provides comprehensive functionality for managing restaurants, menus, orders, payments, and real-time analytics.

## 🚀 Features

### 🔐 Authentication & User Management
- **JWT-based authentication** with secure token management
- **User registration and login** with bcrypt password hashing
- **Role-based access control** for restaurant owners and staff
- **Password reset functionality**

### 📱 QR Menu System
- **Dynamic menu management** with categories and food items
- **Real-time menu updates** across all QR codes
- **Image upload support** for menu items with Cloudinary integration
- **Menu customization** with pricing and availability controls

### 🛍️ Order Management
- **Real-time order processing** with status tracking
- **Table-based ordering** system
- **Order status updates** (pending → ready → completed)
- **Order history and analytics**
- **Automatic table status management**

### 💳 Payment Integration
- **Stripe payment processing** for secure transactions
- **Multiple payment methods** support
- **Payment status tracking**
- **Receipt generation**

### 📊 Analytics & Reporting
- **Sales analytics** with revenue tracking
- **Order analytics** with performance metrics
- **Table utilization reports**
- **Popular items analysis**
- **Customer behavior insights**
- **Real-time dashboard data**

### 🏪 Restaurant Management
- **Multi-restaurant support** with webID system
- **Table management** with status tracking
- **Restaurant-specific configurations**
- **Staff management**

### 🔄 Real-time Features
- **Auto-ping system** to keep servers awake
- **Real-time order notifications**
- **Live table status updates**
- **Instant menu synchronization**

## 🛠️ Technology Stack

### Backend Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### File Management
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **Local file storage** - Fallback option

### Payment Processing
- **Stripe** - Payment gateway integration

### Development Tools
- **Nodemon** - Development server with auto-restart
- **Swagger/OpenAPI** - API documentation
- **Express Async Handler** - Error handling

### Monitoring & Performance
- **Auto-ping system** - Server uptime maintenance
- **Error logging** - Comprehensive error tracking
- **Performance monitoring** - Response time tracking

## 📁 Project Structure

```
Qr-Menu-Backend/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── categoryController.js # Category management
│   │   ├── featureController.js  # Feature management
│   │   ├── foodController.js     # Food item management
│   │   ├── orderController.js    # Order processing
│   │   ├── paymentController.js  # Payment handling
│   │   ├── reportController.js   # Analytics & reporting
│   │   ├── tableController.js    # Table management
│   │   └── uploadController.js   # File upload handling
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorMiddleware.js    # Error handling
│   ├── models/
│   │   ├── categoryModel.js      # Category schema
│   │   ├── Feature.js           # Feature schema
│   │   ├── foodModel.js         # Food item schema
│   │   ├── orderModel.js        # Order schema
│   │   ├── tableModel.js        # Table schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── categoryRoutes.js    # Category routes
│   │   ├── featureRoutes.js     # Feature routes
│   │   ├── foodRoutes.js        # Food routes
│   │   ├── orderRoutes.js       # Order routes
│   │   ├── paymentRoutes.js     # Payment routes
│   │   ├── reportRoutes.js      # Analytics routes
│   │   ├── tableRoutes.js       # Table routes
│   │   └── uploadRoutes.js      # Upload routes
│   ├── uploads/                 # Local file storage
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Stripe account (for payments)
- Cloudinary account (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Qr-Menu-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run server
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
https://qr-menu-backend-hxlj.onrender.com
```

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Menu Management
- `POST /api/foods` - Get all food items
- `POST /api/categories` - Get all categories
- `POST /api/upload/image` - Upload menu images

### Order Management
- `POST /api/orders` - Create new order
- `POST /api/orders/get-orders` - Get orders by webID
- `POST /api/orders/get-current-order` - Get current table order
- `POST /api/orders/update-status` - Update order status

### Payment Processing
- `POST /api/payment/create-payment-intent` - Create payment intent
- `POST /api/payment/confirm-payment` - Confirm payment

### Analytics & Reports
- `POST /api/report/dashboard` - Get dashboard data
- `POST /api/report/sales` - Sales report
- `POST /api/report/popular-items` - Popular items report

### Table Management
- `POST /api/tables/status` - Get table status
- `POST /api/tables/update-status` - Update table status

### Interactive API Documentation
Visit `/swagger` for interactive API documentation with Swagger UI.

## 🔧 Configuration

### Database Configuration
The application uses MongoDB with Mongoose ODM. Configure your database connection in `backend/config/db.js`.

### File Upload Configuration
- **Cloudinary**: Primary image storage (recommended for production)
- **Local Storage**: Fallback option for development

### Payment Configuration
Configure Stripe keys in your environment variables for payment processing.

## 🚀 Deployment

### Render Deployment
This application is optimized for deployment on Render:

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **CORS Protection** - Configured for specific origins
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Secure error responses
- **File Upload Security** - File type and size validation

## 📊 Performance Features

- **Auto-ping System** - Keeps servers awake on Render
- **Database Indexing** - Optimized queries
- **Error Logging** - Comprehensive error tracking
- **Response Caching** - Improved response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **QrMenuPP** - *Initial work* - [QrMenuPP](https://github.com/QrMenuPP)

## 🙏 Acknowledgments

- Express.js community for the excellent framework
- MongoDB team for the robust database
- Stripe for secure payment processing
- Cloudinary for reliable image storage
- Render for seamless deployment

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the API documentation at `/swagger`

---

**Built with ❤️ for the restaurant industry** 