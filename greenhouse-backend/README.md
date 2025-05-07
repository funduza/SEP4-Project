# Greenhouse Monitoring System Backend

A Node.js backend service for the Greenhouse Monitoring System that provides real-time sensor data, historical data analysis, and user authentication.

## Features

- Real-time temperature and humidity monitoring
- Historical data visualization with various time ranges
- JWT-based user authentication with invitation system
- Automatic data generation for testing and demonstration

## Technologies Used

- Node.js with Express
- TypeScript
- MySQL database
- JWT for authentication
- RESTful API architecture

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd greenhouse-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=greenhouse_db
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=24h
   ```

4. Create the database schema
   ```bash
   mysql -u root -p < database/setup.sql
   ```

### Running the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## API Endpoints

### Sensor Data
- `GET /api/sensors` - Get current sensor data
- `GET /api/sensors/history?range=24h` - Get historical data (ranges: 1h, 6h, 12h, 24h, 7d, 30d)
- `POST /api/sensors` - Add new sensor reading (protected)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/verify` - Verify JWT token

## License

This project is licensed under the MIT License.
