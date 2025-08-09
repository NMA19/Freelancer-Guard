# FreelancerGuard Backend

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual values
   ```

4. **Set up MySQL database**
   ```bash
   # Create database and tables using the schema file
   mysql -u your_username -p < database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_NAME=freelancerguard_db

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

#### Experiences
- `GET /api/experiences` - Get all experiences with filters
- `GET /api/experiences/:id` - Get single experience
- `POST /api/experiences` - Create new experience (protected)
- `PUT /api/experiences/:id/vote` - Vote on experience (protected)

#### Health Check
- `GET /` - API status
- `GET /api/health` - Health check with uptime

### Database Schema

The database uses MySQL with the following main tables:
- `users` - User accounts
- `experiences` - User experiences/reviews
- `comments` - Comments on experiences
- `votes` - Upvotes/downvotes on experiences
- `reports` - Reports for inappropriate content

### Security Features

- **Helmet.js** - Security headers
- **Rate limiting** - API rate limiting
- **CORS** - Cross-origin resource sharing
- **Input validation** - Request validation with express-validator
- **Password hashing** - bcrypt for password security
- **JWT authentication** - Secure token-based auth

### Development

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Troubleshooting

1. **Database connection issues**
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Run the schema.sql file to create tables

2. **JWT errors**
   - Ensure JWT_SECRET is set in `.env`
   - Use a strong, random secret key

3. **CORS issues**
   - Update CORS_ORIGINS in `.env` with your frontend URL
