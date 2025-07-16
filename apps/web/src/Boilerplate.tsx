import {
  createBrowserRouter,
  json,
  redirect,
  RouterProvider,
  useRouteError,
} from "react-router-dom";
import { Layout } from "containers/Layout/Layout";
import { Signup } from "routes/Signup/Signup";
import { Login } from "routes/Login/Login";
import { userIdStore } from "cache/userIdStore";
import { cache } from "cache/cache";
import { AuthContainer } from "containers/AuthContainer/AuthContainer";
import { ErrorFallback } from "components/ErrorFallback/ErrorFallback";
import './styles/layout.css';
import { LoadingState } from "components/LoadingState/LoadingState";

const ErrorBoundary = () => {
  const error = useRouteError();

  return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    id: "Layout",
    loader: async ({ request }) => {
      if (userIdStore.getState().id !== null) {
        return null;
      }

      const [userResponse] = await Promise.all([
        await cache.fetchData("user", {
          url: "/1/me/user",
          signal: request.signal,
        }),
      ]);

      if (userResponse.status === 401) {
        return redirect("/login");
      }

      const user = await userResponse.json();

      userIdStore.setState({ id: user.id });

      return json({
        user,
      });
    },
    children: [
      {
        index: true,
        errorElement: <ErrorBoundary />,
        lazy: async () => {
          const { Home } = await import("./routes/Home/Home");
          return { Component: Home };
        },
      },
    ],
  },
  {
    path: "/signup",
    errorElement: <ErrorBoundary />,
    element: <AuthContainer><Signup /></AuthContainer>,
  },
  {
    path: "/login",
    errorElement: <ErrorBoundary />,
    element: <AuthContainer><Login /></AuthContainer>,
  },
  {
    path: "/forgot-password",
    errorElement: <ErrorBoundary />,
    lazy: async () => {
      const { ForgotPassword } = await import("./routes/ForgotPassword/ForgotPassword");
      return { Component: () => <AuthContainer><ForgotPassword /></AuthContainer> };
    },
  },
  {
    path: "/reset-password",
    errorElement: <ErrorBoundary />,
    lazy: async () => {
      const { ResetPassword } = await import("./routes/ResetPassword/ResetPassword");
      return { Component: () => <AuthContainer><ResetPassword /></AuthContainer> };
    },
  },
]);

export const Boilerplate = () => {
  return (
    <RouterProvider router={router} fallbackElement={<LoadingState />} />
  );
}


