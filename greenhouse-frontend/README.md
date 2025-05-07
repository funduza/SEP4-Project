# Greenhouse Monitoring System Frontend

A React-based frontend application for monitoring greenhouse environmental conditions with real-time visualization and historical data analysis.

## Features

- Real-time temperature and humidity monitoring
- Historical data visualization with various time ranges (1h, 6h, 12h, 24h, 7d, 30d)
- Responsive dashboard with interactive charts
- User authentication and account management
- Invitation-based registration system

## Technologies Used

- React
- TypeScript
- Recharts for data visualization
- JWT authentication
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Greenhouse Monitoring Backend running

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd greenhouse-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:3000
   ```

### Running the Application

For development:
```bash
npm start
```

For production build:
```bash
npm run build
```

## Main Components

- **Dashboard:** Main monitoring interface showing current sensor data and historical charts
- **Login/Register:** User authentication screens with invitation-based registration
- **Header:** Navigation component with user information
- **Charts:** Data visualization components for temperature and humidity trends

## Integration with Backend

This frontend application communicates with the Greenhouse Monitoring Backend through RESTful API calls. Make sure the backend is running before starting the frontend application.

## License

This project is licensed under the MIT License.
