# GlobalTrotter ✈️

GlobalTrotter is a collaborative travel itinerary planning and management application.

## Key Features
- **Dashboard & Search**: Explore cities by budget index, activity ratings, or geographic regions.
- **Itinerary Builder**: Drag, drop, add, and re-order daily trip segments, activities, times, and budgets.
- **Shared Itineraries**: Publish public read-only trip timetables, easily clone itineraries, and copy social share links.
- **Financial Analytics**: View overall cost categories, expense bars, and warnings if budgets are breached.
- **Trip Calendar**: Inline edit and re-schedule trip timelines on a month-based grid interface.
- **User Settings**: Update languages preferences, travel profiles, and upload base64 avatars.
- **Developer/Admin Dashboard**: Track user stats, destination rankings, and manage roles.

## Tech Stack
- **Frontend**: React + Vite, CSS Modules, Lucide React Icons
- **Backend**: Node.js + Express, JWT authentication (JSON Web Tokens)
- **Database**: MongoDB + Mongoose

## Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and MongoDB installed and running on your system.

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/globetrotter
JWT_SECRET=your_jwt_secret_token_here
```

### 3. Install Dependencies & Run

#### Run the Backend
```bash
cd server
npm install
npm start
```
The server will start on port `5000`.

#### Run the Frontend
```bash
cd client
npm install
npm run dev
```
The client will start dev server on port `5173`.
