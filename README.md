# Expense Tracker

A clean responsive Next.js expense tracker with MongoDB Atlas persistence.

## Features

- Add expenses with amount, description, category, and date
- Delete expenses with confirmation
- View expense cards with category and date
- Filter expenses by category
- Total spending and monthly totals in Indian Rupees (`₹`)
- MongoDB Atlas backend using App Router API routes
- Production-ready Tailwind CSS UI

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your MongoDB Atlas connection string:

```env
MONGODB_URI="your-mongodb-atlas-connection-string"
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Build

To verify production readiness:

```bash
npm run build
```

## Environment

Make sure `.env.local` is excluded from version control. The repository already ignores sensitive files like:

- `.env.local`
- `node_modules/`
- `.next/`

## Deployment

This app is compatible with Vercel and other Node.js hosts.

## Repository

GitHub: https://github.com/adityapd1445/Expense-Tracker
