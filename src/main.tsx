/**
 * Budget-Wise: Application Entry Point
 * 
 * Purpose: Main entry point for the React application
 * Author: Budget-Wise Development Team
 * Created: 2024
 * Last Modified: 2025-01-07
 * 
 * Description: This file initializes the React application by creating a root element
 * and rendering the main App component. It serves as the bridge between the HTML
 * template and the React component tree, setting up the foundation for the entire
 * Budget-Wise application.
 */

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the root DOM element from the HTML template
// The non-null assertion (!) is safe because we know the element exists in index.html
const rootElement = document.getElementById("root")!;

// Create React root and render the main App component
// This initializes the entire React application tree
createRoot(rootElement).render(<App />);
