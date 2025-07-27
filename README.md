# Birdnest Shop - Monorepo

This is a monorepo containing the frontend and backend for the Birdnest Shop application.

## Project Structure

```
birdnest-shop/
├── frontend/          # Next.js 15 frontend application
├── backend/           # Backend API (future implementation)
├── package.json       # Root package.json for monorepo
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start production server:
   ```bash
   npm run start
   ```

## Frontend

The frontend is a Next.js 15 application located in the `frontend/` directory.

### Features

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- NextAuth.js for authentication
- Prisma ORM with PostgreSQL
- Stripe payment integration
- Responsive design
- Admin dashboard

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Backend

The backend directory is reserved for future backend API implementation.

## Development

### Working with the Frontend

```bash
cd frontend
npm run dev
```

### Working with the Backend

```bash
cd backend
# Backend setup instructions will be added here
```

## Deployment

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary. 