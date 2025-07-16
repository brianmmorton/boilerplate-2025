import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import { cache } from "cache/cache";
import { fetchWithAuth } from "utils/fetchWithAuth";
import { getRefreshToken, setRefreshToken, setToken } from "utils/tokens/getToken";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"
import { userIdStore, useUserId } from "cache/userIdStore";
import { currentCompanyStore } from "cache/currentCompanyStore";
import { currentProductStore } from "cache/currentProductStore";
import { useModel } from "cache/cache";
import { Heart, LogOut, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navigation = () => {
  const navigate = useNavigate();
  const userId = useUserId();
  const firstName = useModel('user', userId, (state) => state?.firstName);
  const lastName = useModel('user', userId, (state) => state?.lastName);

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      setToken('');
      setRefreshToken('');
      cache.clear();
      userIdStore.getState().set(null);
      currentCompanyStore.getState().set(null);
      currentProductStore.getState().set(null);
  
      setTimeout(async () => {
        await fetchWithAuth(`/1/auth/logout`, {
          method: "POST",
          body: JSON.stringify({
            refreshToken,
          }),
        });
      }, 200);

      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const userInitials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div
      className={classNames(
        "sticky top-0 left-0 right-0 pr-6 pl-6 backdrop-blur-xl z-50 border-0 bg-white/95 shadow-sm"
      )}
    >
      <div className="py-4 px-0 lg:px-0 lg:py-3 border-b border-gray-200/60 mx-auto flex items-center justify-between text-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">            
            <div className="flex flex-row items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight transition-colors duration-200 hover:text-gray-700">
                  ScoutSense
                </h1>
                <p className="text-xs font-medium text-gray-500 tracking-wide -mt-0.5 transition-colors duration-200 hover:text-gray-600 relative -top-1">
                  Product Intelligence
                </p>
              </div>
            </div>
          </div>
        </div>

        <NavigationMenu>
          <NavigationMenuList className="gap-2">            
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-3 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors border-0 bg-transparent">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-700">
                  {firstName} {lastName}
                </span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="py-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200/80 backdrop-blur-sm">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{firstName} {lastName}</p>
                        <p className="text-sm text-gray-500">Account Settings</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> 
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};
