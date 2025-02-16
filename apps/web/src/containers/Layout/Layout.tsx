import { Navigation } from "containers/Navigation/Navigation";
import { Sidebar } from "containers/Sidebar/Sidebar";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { MaybeOnboarding } from "./Onboarding/MaybeOnboarding";
import { User } from "types/User";
import { cache } from "cache/cache";
import { useUserId } from "cache/userIdStore";
import { differenceInMinutes } from "date-fns";

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
              if (differenceInMinutes(lastCheck, new Date()) > 15) {
                fetch("/1/auth/refresh-tokens", {
                  method: "POST",
                  credentials: "include",
                });
              }
            }

            intervalId = window.setInterval(() => {
              lastCheck = new Date();
              fetch("/1/auth/refresh-tokens", {
                method: "POST",
                credentials: "include",
              });
            }, 15 * 60 * 1000);
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
    <main className="w-full h-full bg-blue-gray-50 flex text-blue-gray-800">
      <Sidebar />

      <div className="flex-1 pb-10">
        <Navigation />

        <div className="flex relative flex-1 top-6">
          {/* bg-gradient-to-b from-blue-50 from-0% via-blue-100 via-5% to-white to-40% */}
          <div className="relative pl-8 pr-8 pt-6 w-11/12 mr-6 overflow-y-auto text-current flex-1">
            <section>
              {initialized && <MaybeOnboarding />}
              <Outlet />
            </section>
            {/* <footer className="p-4 absolute left-0 bottom-0 bg-gray-100 dark:bg-gray-600 w-full">
                    <p>My footer content</p>
                  </footer> */}
          </div>
        </div>
      </div>
    </main>
  );
};
