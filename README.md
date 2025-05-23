# Task Management System

A full-stack web application for task management with user authentication, task CRUD operations, document attachments, and more.

## Features

- User authentication with JWT
- User management (CRUD operations)
- Task management (CRUD operations)
- Task assignment to users
- Document attachments (up to 3 PDFs per task)
- Task filtering and sorting
- Responsive UI

## Tech Stack

### Frontend
- React
- Redux for state management
- React Router for navigation
- Axios for API requests
- React Feather for icons

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Multer for file uploads

### DevOps
- Docker for containerization
- Docker Compose for multi-container setup

## Installation and Setup

### Using Docker (Recommended)

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system
   \`\`\`

2. Start the application using Docker Compose:
   \`\`\`
   docker-compose up
   \`\`\`

3. Access the application at http://localhost:5000

### Manual Setup

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   \`\`\`

3. Create a `.env` file in the backend directory with the following variables:
   \`\`\`
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   \`\`\`

4. Start MongoDB:
   \`\`\`
   # Using MongoDB locally
   mongod
   \`\`\`

5. Run the application in development mode:
   \`\`\`
   # From the root directory
   npm run dev
   \`\`\`

6. Access the application at http://localhost:3000

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user

### User Endpoints

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user (admin only)
- `POST /api/users` - Create a new user (admin only)
- `PUT /api/users/:id` - Update a user (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)
- `PUT /api/users/profile` - Update current user profile

### Task Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/:id/documents/:documentId` - Download a document

## Testing

Run tests using Jest:

\`\`\`
npm test
\`\`\`


