import React, { useEffect } from 'react';
import { FallbackProps } from "react-error-boundary";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps extends FallbackProps {}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  useEffect(() => {
    // You can implement error reporting logic here
    const errorDetails = {
      message: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    };
    
    // For now, we'll just console.log the error
    console.error('Reported error:', errorDetails);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-mono overflow-auto">
              {error?.message || String(error)}
            </p>
          </div>
          <p className="text-gray-600">
            We apologize for the inconvenience. Please try again or contact support if the problem persists.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={resetErrorBoundary} className="w-full">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 