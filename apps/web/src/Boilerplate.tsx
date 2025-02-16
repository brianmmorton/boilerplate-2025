import React from "react";
import { ThemeProvider } from "@material-tailwind/react";
import {
  createBrowserRouter,
  json,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { App } from "routes/App/App";
import { Layout } from "containers/Layout/Layout";
import { Signup } from "routes/Signup/Signup";
import { Login } from "routes/Login/Login";
import { theme } from "theme";
import { userIdStore } from "cache/userIdStore";
import { cache } from "cache/cache";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    id: "Layout",
    loader: async ({ request }) => {
      if (
        userIdStore.getState().id !== null
      ) {
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
        element: <App />,
      },
      {
        path: "example/:exampleId",
        id: "Example",
        loader: async ({ params, request }) => {
          return cache.fetchData("user", {
            url: `/1/features/${params.exampleId}`,
            signal: request.signal,
          });
        },
        children: [
          {
            index: true,
            lazy: async () => {
              const { Example } = await import("./routes/Example/Example");

              return { Component: Example };
            },
          },
          {
            path: ":tab",
            lazy: async () => {
              const { Example } = await import("./routes/Example/Example");

              return { Component: Example };
            },
          },
        ],
      },
    ],
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

function Boilerplate() {
  return (
    <ThemeProvider value={theme}>
      <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
    </ThemeProvider>
  );
}

export default Boilerplate;
