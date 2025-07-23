# Testing Setup for Budget Wise

## Overview
This project uses Vitest with React Testing Library for comprehensive test coverage, meeting the requirements for Chapter 4 of the project specification.

## Test Structure
- **Unit Tests**: Individual components and hooks
- **Integration Tests**: Page-level functionality
- **Mock Configuration**: Comprehensive mocking for Supabase and external dependencies

## Coverage Areas
1. **Components**: Header, StatCard, AppSidebar
2. **Hooks**: useBudgetData for data management
3. **Pages**: Dashboard functionality
4. **Test Utilities**: Shared test setup and providers

## Running Tests
```bash
npm test           # Run all tests
npm run test:ui    # Run with UI interface
npm run test:coverage  # Run with coverage report
```

## Test Files Location
- Component tests: `src/components/__tests__/`
- Hook tests: `src/hooks/__tests__/`
- Page tests: `src/pages/__tests__/`
- Test utilities: `src/test/`

## Academic Requirements Met
✅ Complete test plan for system requirements
✅ Automated tests covering main functionality
✅ Partition testing approach for comprehensive coverage
✅ Test cases for all major units of code