# Symatech Labs — Frontend

A production-ready React + TypeScript + Tailwind CSS e-commerce frontend connected to the Symatech Labs Laravel backend.

## Tech Stack

- **React 18** + **TypeScript** — Component-based UI with full type safety
- **Vite** — Lightning-fast build tool
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **React Router v6** — Client-side routing with protected routes
- **Axios** — HTTP client with JWT interceptors
- **Sonner** — Toast notifications
- **Lucide React** — Icon library

## Features

- JWT authentication (login, register, protected routes)
- Role-based access control (admin vs customer)
- Product catalog with search and category filtering
- Shopping cart (optimistic UI + backend sync)
- Checkout with M-PESA STK Push and Flutterwave
- Order history
- Admin dashboard (products, orders, users, reports)
- Dark/light mode toggle
- Responsive mobile design
- Graceful fallback to mock data if backend is unavailable

## Project Structure

```
src/
├── api/              # Axios API calls (auth, products, cart, orders, payments)
├── components/
│   ├── admin/        # Admin modals
│   ├── cart/         # Cart item row
│   ├── layout/       # Header, Footer, MainLayout
│   ├── products/     # ProductCard
│   └── ui/           # Reusable primitives (Button, Input, Badge, etc.)
├── context/
│   ├── AuthContext.tsx    # JWT auth state management
│   └── CartContext.tsx    # Cart state + backend sync
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── types.ts      # TypeScript interfaces
│   ├── mock-data.ts  # Fallback mock data
│   └── utils.ts      # cn() helper
└── pages/            # Route pages
```

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/symatech-frontend.git
cd symatech-frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your keys
```

```env
VITE_API_BASE_URL=https://symatech-backend.onrender.com/api
VITE_FLW_PUBLIC_KEY=your_flutterwave_public_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
npm run build
```

## API Integration

All API calls are in `src/api/`. The axios client in `src/api/client.ts` automatically:
- Attaches the JWT token from `localStorage` to every request
- Redirects to `/login` on 401 responses

## Payment Integration

### M-PESA
The frontend sends the phone number and amount to the backend, which triggers a Daraja STK Push. The user receives a prompt on their phone to complete payment.

### Flutterwave
Uses the Flutterwave JavaScript SDK to open a payment modal. On successful payment, the order is created via the backend API.


## Trello Board link
https://trello.com/invite/b/6994b0e3454e156f7458c656/ATTIc6e66c8204cb61de504ef28759ae41c7539638A8/symatech-full-stack-assessment-sprint

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect repo on vercel.com
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

## Architecture Decisions

- **Optimistic UI updates** — Cart updates instantly, syncs to backend async
- **JWT interceptor** — Centralized auth header injection
- **Graceful degradation** — Falls back to mock data if backend is unavailable
- **Role-based routing** — `ProtectedRoute` handles auth + admin guards
- **Design tokens** — All colors defined as CSS HSL variables for dark mode support
