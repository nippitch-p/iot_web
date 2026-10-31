@echo off
echo =========================================================
echo   Student Management CRUD (React + Express + PostgreSQL)
echo =========================================================
echo.
echo Starting Backend Server on http://localhost:5000 ...
start "Backend (Express + PostgreSQL)" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Vite + React) on http://localhost:3000 ...
start "Frontend (React + Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================
echo   Application Launched!
echo   - Web UI:     http://localhost:3000 (or http://localhost:5000)
echo   - Backend API: http://localhost:5000/api/v1/students
echo =========================================================
pause
