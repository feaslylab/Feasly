import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SimpleAuthPage() {
  console.log("SimpleAuthPage rendering");
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Feasly
          </Link>
        </div>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-6">Log in to your account</p>
          
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input 
                type="email" 
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Password</label>
              <input 
                type="password" 
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter your password"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Log In
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button className="text-primary hover:underline">
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}