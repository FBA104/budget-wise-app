/**
 * Index page component
 * Fallback landing page - update this page content as needed
 */

// fallback page component for root route (if dashboard is not the main page)
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background"> {/* full height centered layout */}
      <div className="text-center"> {/* centered content container */}
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1> {/* main heading */}
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p> {/* subtitle */}
      </div>
    </div>
  );
};

export default Index;
