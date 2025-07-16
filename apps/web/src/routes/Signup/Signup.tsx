import { cache } from "cache/cache";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { setToken, setRefreshToken } from "utils/tokens/getToken";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { Mail, Users, AlertTriangle } from "lucide-react";

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tos: boolean;
  inviteToken?: string;
};

interface InviteInfo {
  companyName: string;
  inviterName: string;
  role: string;
  email: string;
}

export const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(!!inviteToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
    setValue,
  } = useForm<Inputs>();

  // Load invitation info if invite token is present
  useEffect(() => {
    if (inviteToken) {
      loadInviteInfo();
    }
  }, [inviteToken]);

  const loadInviteInfo = async () => {
    try {
      setIsLoadingInvite(true);
      
      // For now, we'll decode the invite token on the client side to get basic info
      // In a production app, you might want to validate this with the server first
      try {
        const payload = JSON.parse(atob(inviteToken!.split('.')[1]));
        setInviteInfo({
          companyName: payload.companyName || 'Unknown Company',
          inviterName: payload.inviterName || 'Someone',
          role: payload.role || 'USER',
          email: payload.email || ''
        });
        
        // Pre-fill email if provided in the invite
        if (payload.email) {
          setValue('email', payload.email);
        }
      } catch (err) {
        console.error('Error parsing invite token:', err);
        setError('Invalid invitation link. Please request a new invitation.');
      }
    } catch (err) {
      console.error('Error loading invite info:', err);
      setError('Failed to load invitation details. Please try again.');
    } finally {
      setIsLoadingInvite(false);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError("");
    
    try {
      let endpoint = "/1/auth/register";
      let body = { ...data };

      // If signing up via invitation, use the invitation acceptance endpoint
      if (inviteToken) {
        endpoint = "/1/memberships/accept-invitation";
        body = {
          ...data,
          inviteToken: inviteToken
        };
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
          if (errorData.message.toLowerCase().includes("email already taken")) {
            setFieldError("email", {
              type: "server",
              message: "This email is already registered. Try logging in instead."
            });
          } else if (errorData.message.toLowerCase().includes("invalid") && inviteToken) {
            setError("This invitation link is invalid or has expired. Please request a new invitation.");
          } else {
            setError(errorData.message);
          }
        } else {
          setError(inviteToken ? "Failed to accept invitation. Please try again." : "Failed to create account. Please try again.");
        }
        return;
      }

      const { tokens, user } = await response.json();

      setToken(tokens.access.token);
      setRefreshToken(tokens.refresh.token);

      cache.httpCache.setState(cache.httpCache.getInitialState());

      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingInvite) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading invitation details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">
          {inviteToken ? "Join Your Team" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {inviteToken 
            ? "Complete your profile to join the team" 
            : "Enter your information to create an account"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Invitation Info */}
        {inviteToken && inviteInfo && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4" />
                <strong>You've been invited to join {inviteInfo.companyName}</strong>
              </div>
              <p className="text-sm">
                {inviteInfo.inviterName} has invited you to join as a{' '}
                <span className="font-medium">
                  {inviteInfo.role === 'ADMINISTRATOR' ? 'Administrator' : 
                   inviteInfo.role === 'COLLABORATOR' ? 'Collaborator' : 'Team Member'}
                </span>
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              {...register("firstName", { required: "First name is required" })}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              {...register("lastName", { required: "Last name is required" })}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
                             disabled={!!(inviteToken && inviteInfo?.email)}
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {inviteToken && inviteInfo?.email && (
              <p className="text-xs text-gray-500">
                This email was specified in your invitation and cannot be changed.
              </p>
            )}
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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

          <div className="space-y-2 flex items-center gap-2">
            <Checkbox 
              id="tos" 
              className="mt-2 px-0" 
              {...register("tos", { required: "You must agree to the terms of service" })} 
            />
            <div className="text-sm mt-0 px-0 flex items-center gap-1">
              <p className="text-muted-foreground">I agree to the</p> 
              <Link to="/terms" className="text-blue-500">Terms of Service</Link>
              <p className="text-muted-foreground"> and </p>
              <Link to="/privacy" className="text-blue-500">Privacy Policy</Link>
            </div>
          </div>
          {errors.tos && (
            <p className="text-sm text-red-500">{errors.tos.message}</p>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              inviteToken ? "Joining team..." : "Creating account..."
            ) : (
              inviteToken ? "Join Team" : "Sign up"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant='link' className="p-0" onClick={() => navigate("/login")}>
            Login
          </Button>
        </p>
        {!inviteToken && (
          <Button variant="link" className="p-0 text-sm" onClick={() => navigate("/forgot-password")}>
            Forgot your password?
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
