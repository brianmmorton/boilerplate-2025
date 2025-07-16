import { cache } from "cache/cache";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { setToken, setRefreshToken } from "utils/tokens/getToken";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Inputs = {
  email: string;
  password: string;
};

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.errors) {
          // Handle validation errors from Zod
          errorData.errors.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              const fieldName = error.path[0] as keyof Inputs;
              setFieldError(fieldName, { 
                type: "server", 
                message: error.message 
              });
            }
          });
          setError("Please correct the errors below.");
        } else if (errorData.message) {
          // Handle specific API errors
          if (errorData.message.toLowerCase().includes("incorrect email or password")) {
            setError("Invalid email or password. Please check your credentials and try again.");
          } else {
            setError(errorData.message);
          }
        } else {
          setError("Failed to log in. Please try again.");
        }
        return;
      }

      const { tokens, user } = await response.json();

      setToken(tokens.access.token);
      setRefreshToken(tokens.refresh.token);

      cache.httpCache.setState(cache.httpCache.getInitialState());

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");
    navigate("/forgot-password");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            
            <div className="text-center">
              <Button variant="link" className="p-0 text-sm" onClick={handleForgotPassword}>
                Forgot your password?
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0" onClick={() => navigate("/signup")}>
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};
