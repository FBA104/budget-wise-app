/**
 * Auth - login and signup page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  // form input states
  const [email, setEmail] = useState(''); // user's email address
  const [password, setPassword] = useState(''); // user's password
  const [loading, setLoading] = useState(false); // prevent multiple submissions
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const { toast } = useToast(); // for showing notifications
  const navigate = useNavigate(); // for redirecting after login

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // get current user
      if (user) {
        navigate('/'); // redirect to dashboard if logged in
      }
    };
    checkUser(); // run on component mount

    // Listen for auth changes (login/logout events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/'); // redirect to dashboard when user logs in
      }
    });

    return () => subscription.unsubscribe(); // cleanup on unmount
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent form from reloading page
    setLoading(true); // disable form while processing

    try {
      // attempt to create new user account
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/` // redirect after email confirmation
        }
      });

      if (error) throw error; // throw to catch block if failed

      // show success message
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    } catch (error: any) {
      // show error message if signup failed
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false); // re-enable form regardless of outcome
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent form from reloading page
    setLoading(true); // disable form while processing

    try {
      // attempt to sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error; // throw to catch block if failed

      // show success message
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    } catch (error: any) {
      // show error message if signin failed
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false); // re-enable form regardless of outcome
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4"> {/* full screen centered layout */}
      <div className="w-full max-w-md"> {/* constrain width for mobile/desktop */}
        {/* app branding section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-full"> {/* app icon container */}
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Budget Wise</h1> {/* app name */}
          <p className="text-muted-foreground">
            Your personal finance management companion
          </p>
        </div>

        {/* main auth card */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* tabs for signin/signup */}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2"> {/* equal width tabs */}
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* sign in form */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* email input */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email} // controlled input
                      onChange={(e) => setEmail(e.target.value)} // update email state
                      required
                    />
                  </div>
                  {/* password input with toggle visibility */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"} // toggle between text/password
                        placeholder="Enter your password"
                        value={password} // controlled input
                        onChange={(e) => setPassword(e.target.value)} // update password state
                        required
                      />
                      {/* eye icon button to toggle password visibility */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)} // toggle visibility
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" /> // hide password icon
                        ) : (
                          <Eye className="h-4 w-4" /> // show password icon
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* submit button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-primary-hover"
                    disabled={loading} // disable while processing
                  >
                    {loading ? 'Signing in...' : 'Sign In'} {/* loading text */}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:bg-primary-hover"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}