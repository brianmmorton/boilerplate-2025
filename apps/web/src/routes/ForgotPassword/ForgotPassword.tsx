import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";

type Inputs = {
  email: string;
};

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/1/auth/forgot-password`, {
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
          setError(errorData.message);
        } else {
          setError("Failed to send reset email. Please try again.");
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Didn't receive the email?</strong> Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => navigate("/login")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
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
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" className="p-0" onClick={() => navigate("/login")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}; 