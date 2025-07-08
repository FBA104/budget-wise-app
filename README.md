# Budget-Wise

A comprehensive personal finance management application built with React, TypeScript, and Supabase.

## Features

- Transaction Management: Track income and expenses
- Budget Tracking: Set and monitor spending limits
- Financial Goals: Define and track progress towards financial targets
- Dashboard Analytics: Real-time overview of financial status
- Recurring Transactions: Automate regular income and expenses
- Category Management: Organize transactions with custom categories

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- shadcn/ui for UI components
- Supabase for backend and authentication
- PostgreSQL database with Row Level Security
- Vitest for testing

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd budget-wise-app
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:8082 in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── components/      # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── integrations/   # External service integrations
└── lib/            # Utility functions
```

## Testing

The project includes unit tests for components, hooks, and utilities. Run tests with:

```bash
npm test
```

## Deployment

Build the application:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License
