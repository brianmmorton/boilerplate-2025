import { Navigation } from "containers/Navigation/Navigation";
import React, { FunctionComponent, lazy, useEffect, useState, Suspense } from "react";
import { Outlet, useLoaderData, useLocation, useParams } from "react-router-dom";
import { User } from "types/User";
import { cache } from "cache/cache";
import { useUserId } from "cache/userIdStore";
import { differenceInMinutes, differenceInDays } from "date-fns";
import { fetchWithAuth } from "utils/fetchWithAuth";
import { getRefreshToken } from "utils/tokens/getToken";
import { useModel } from "cache/cache";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSocket } from "@/cache/useSocket";

// Socket initialization component to prevent Layout rerenders
const SocketInitializer = () => {
  useSocket();
  return null;
};

const ScrollToTopOnRouteChange = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
  }, [location]);
  return null;
};

export const Layout: FunctionComponent = () => {
  const data = useLoaderData() as { user: User } | null;
  const [initialized, setInitialized] = useState(false);
  const userId = useUserId();

  useEffect(() => {
    if (!data || initialized) {
      return;
    }

    setInitialized(true);
  }, [data, initialized]);

  useEffect(() => {
    if (initialized) {
      if (userId) {
        const user = cache.get("user", `${userId}`);
        if (user) {
          let intervalId: number | null = null;
          let lastCheck: Date | null = null;

          const clearTokenInterval = () => {
            if (intervalId !== null) {
              window.clearInterval(intervalId);
            }
          };

          const setupInterval = () => {
            clearTokenInterval();

            if (lastCheck) {
              if (differenceInMinutes(lastCheck, new Date()) > 30) {
                fetchWithAuth(`${process.env.REACT_APP_API_URL}/1/auth/refresh-tokens`, {
                  method: "POST",
                  body: JSON.stringify({
                    refreshToken: getRefreshToken(),
                  }),
                });
              }
            }

            intervalId = window.setInterval(() => {
              lastCheck = new Date();
              fetchWithAuth(`${process.env.REACT_APP_API_URL}/1/auth/refresh-tokens`, {
                method: "POST",
                body: JSON.stringify({
                  refreshToken: getRefreshToken(),
                }),
              });
            }, 30 * 60 * 1000);
          };

          const onVisChange = () => {
            if (document.visibilityState === "visible") {
              setupInterval();
              return;
            }

            clearTokenInterval();
          };

          window.addEventListener("visibilitychange", onVisChange);
          setupInterval();

          return () => clearTokenInterval();
        }
      }
    }
  }, [initialized, userId]);


  return (
    <main className="flex h-screen text-blue-gray-800">
      <SocketInitializer />
      <ScrollToTopOnRouteChange />
      <Navigation />

      <div className="flex relative flex-1">
        <div className="relative w-full text-current flex-1 pt-2 px-8 pb-8 h-screen overflow-y-auto" id="main-content">
          <section className="mx-auto space-y-6">
            <div className="pt-2 px-8 pb-8">
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
