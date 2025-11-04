# SlotSwapper

A simple peer-to-peer time-slot swapping system built with React and Node.js.

## Features

- **Authentication**: Sign-up/login with email and password using JWT
- **Calendar Management**: Create, edit, delete events with swappable status
- **Marketplace**: View and request swaps for other users' available slots
- **Swap Requests**: Send, receive, accept, or reject swap requests
- **Real-time Status Updates**: Events automatically update status during swap process

## Tech Stack

- **Backend**: Node.js, Express, Prisma ORM, SQLite
- **Frontend**: React, React Router
- **Authentication**: JWT with bcrypt password hashing

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
npx prisma migrate dev --name init
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5001`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Create Events**: Add events to your calendar and mark them as swappable
3. **Browse Marketplace**: View other users' swappable time slots
4. **Request Swaps**: Select your slot to swap with someone else's slot
5. **Manage Requests**: Accept or reject incoming swap requests

## Database Schema

### User
- id, name, email, password

### Event
- id, title, startTime, endTime, status (BUSY/SWAPPABLE/SWAP_PENDING), ownerId

### SwapRequest
- id, mySlotId, theirSlotId, fromUserId, toUserId, status (PENDING/ACCEPTED/REJECTED)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get user's events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Swaps
- `GET /api/swappable-slots` - Get all swappable slots (except user's own)
- `POST /api/swap-request` - Create swap request
- `POST /api/swap-response/:id` - Accept/reject swap request
- `GET /api/swap-requests` - Get user's swap requests (incoming/outgoing)