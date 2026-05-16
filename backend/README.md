# DramaList Pakistan - Backend API

Node.js + Express + Sequelize backend for the DramaList Pakistan application.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dramalist_pk
DB_USER=root
DB_PASSWORD=your_password
```

### 3. Create Database
Open phpMyAdmin and create a database named `dramalist_pk`.

### 4. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`.

### 5. Seed Data (Optional)
Data will be auto-synced on first run. Or run:
```bash
npm run db:seed
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Dramas (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dramas` | Get all dramas (with filters) |
| GET | `/api/dramas/:id` | Get single drama |
| GET | `/api/dramas/top-rated` | Get top rated |
| GET | `/api/dramas/airing` | Get currently airing |
| GET | `/api/dramas/upcoming` | Get upcoming |
| GET | `/api/dramas/channels` | Get all channels |
| GET | `/api/dramas/genres` | Get all genres |

### User Drama List (Private - requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/dramas` | Get user's drama list |
| GET | `/api/user/stats` | Get user statistics |
| POST | `/api/user/dramas` | Add drama to list |
| PUT | `/api/user/dramas/:id` | Update drama entry |
| DELETE | `/api/user/dramas/:id` | Remove from list |

## Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dramaController.js
│   │   └── userDramaController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Drama.js
│   │   └── ...
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── dramaRoutes.js
│   │   └── userDramaRoutes.js
│   ├── seeders/
│   │   └── 20241225-seed-dramas.js
│   └── server.js
├── .env
├── .env.example
└── package.json
```

## Testing API

Use the health endpoint to verify server is running:
```bash
curl http://localhost:5000/api/health
```

### Example: Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```
