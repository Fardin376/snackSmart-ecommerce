# SnackSmart E-Commerce

A full-stack e-commerce application built with React, Node.js, Express, and Prisma.

## Features

- User authentication (register, login, email confirmation)
- Product catalog with search and sort functionality
- Shopping cart with real-time updates
- Admin panel for managing products, customers, orders, and coupons
- Responsive design with Material-UI

## Tech Stack

### Frontend

- React with Vite
- Material-UI
- React Router
- Axios

### Backend

- Node.js
- Express.js
- Prisma ORM
- MySQL Database
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL Database
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/Fardin376/snackSmart-ecommerce.git
cd snackSmart-ecommerce
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd frontend
npm install
```

4. Configure environment variables
   Create a `.env` file in the backend directory with:

```
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
JWT_SECRET="your-secret-key"
PORT=4000
```

5. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

6. Start the backend server

```bash
cd backend
npm run dev
```

7. Start the frontend development server

```bash
cd frontend
npm run dev
```

## Project Structure

```
ecommerce-project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── layouts/
    └── package.json
```

## License

MIT
