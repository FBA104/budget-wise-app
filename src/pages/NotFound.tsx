/**
 * NotFound - 404 error page
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation(); // get current route information

  useEffect(() => {
    // log 404 error to console for debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]); // run when route changes

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100"> {/* full screen centered layout */}
      <div className="text-center"> {/* center the content */}
        <h1 className="text-4xl font-bold mb-4">404</h1> {/* large error code */}
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p> {/* user-friendly message */}
        <a href="/" className="text-blue-500 hover:text-blue-700 underline"> {/* link back to home */}
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
