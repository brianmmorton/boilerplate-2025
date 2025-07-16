import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

type Inputs = {
  password: string;
  confirmPassword: string;
};

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
    watch,
  } = useForm<Inputs>();

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/1/auth/reset-password?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
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
          if (errorData.message.toLowerCase().includes("token")) {
            setError("This reset link has expired or is invalid. Please request a new password reset.");
          } else {
            setError(errorData.message);
          }
        } else {
          setError("Failed to reset password. Please try again.");
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
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
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Password Reset Successful</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully reset. You can now log in with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/login")}>
            Continue to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-center">Invalid Reset Link</CardTitle>
          <CardDescription className="text-center">
            This password reset link is invalid or has expired. Please request a new password reset.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/forgot-password")}>
            Request New Reset Link
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
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