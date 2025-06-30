# SmartInternz Project

This project consists of a backend and frontend application.

## Project Documentation and Deployment Guide

- [Project Documentation](./PROJECT_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### Demo Video and Project Screenshots
- [Demo Video Link](https://drive.google.com/file/d/1ysBxgLoGWY3t5lp9a-1gwRE8YAxPokcu/view?usp=drive_link)
- [Project Screenshots Link](https://drive.google.com/drive/folders/1JJr6ZtMOBhoqUT-xjoi8spZ_AjTY9rLU?usp=drive_link)

## Prerequisites

- Node.js and npm installed on your system.
- MongoDB running and accessible (set the connection string in backend/.env).

## Setup and Run Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install backend dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following variables:
   ```
   PORT=5000
   MONGODB_URL=your_mongodb_connection_string
   ```

4. Start the backend server:
   ```
   npm run dev
   ```
   This will start the backend server on port 5000.

## Setup and Run Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `frontend` directory with the following variable:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```
   npm start
   ```
   This will start the frontend on port 3000.

## Notes

- Make sure to restart the frontend server after creating or modifying the `.env` file to load environment variables.
- The backend server must be running before using the frontend to avoid connection errors.
- Use the admin login to access admin features like managing doctors and appointments.

## Common Commands

### Backend
- `npm run dev` - Start backend server with nodemon (auto-restart on changes)
- `npm start` - Start backend server normally

### Frontend
- `npm start` - Start frontend development server
- `npm run build` - Build frontend for production

## Troubleshooting

- If you encounter missing dependencies or build errors, run `npm install` in the respective directories.
- Ensure MongoDB is running and the connection string is correct in the backend `.env` file.
- Restart servers after any configuration changes.

---

This README provides all necessary commands and setup instructions to run the project smoothly without clumsy errors.
