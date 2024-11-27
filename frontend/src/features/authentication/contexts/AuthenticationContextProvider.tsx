import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "../../../components/Loader/Loader";
import { request } from "../../../utils/api";

interface AuthenticationResponse {
  token: string;
  messgage: string;
}
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  location?: string;
  profileComplete: boolean;
  profilePicture?: string;
}

interface AuthenticationContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
}

const AuthenticationContext = createContext<AuthenticationContextType | null>(null);

export function useAuthentication() {
  return useContext(AuthenticationContext)!;
}

export function AuthenticationContextProvider() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOnAuthPage =
    location.pathname === "/authentication/login" ||
    location.pathname === "/authentication/signup" ||
    location.pathname === "/authentication/request-password-reset";

  const login = async (email: string, password: string) => {
    await request<AuthenticationResponse>({
      endpoint: "/api/v1/authentication/login",
      method: "POST",
      body: JSON.stringify({ email, password }),
      onSuccess: ({ token }) => {
        localStorage.setItem("token", token);
      },
      onFailure: (error) => {
        throw new Error(error);
      },
    });
  };

  const signup = async (email: string, password: string) => {
    await request<AuthenticationResponse>({
      endpoint: "/api/v1/authentication/register",
      method: "POST",
      body: JSON.stringify({ email, password }),
      onSuccess: ({ token }) => {
        localStorage.setItem("token", token);
      },
      onFailure: (error) => {
        throw new Error(error);
      },
    });
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    if (user) {
      return;
    }
    setIsLoading(true);
    const fetchUser = async () => {
      await request<User>({
        endpoint: "/api/v1/authentication/user",
        onSuccess: (data) => setUser(data),
        onFailure: (error) => {
          console.log(error);
        },
      });
      setIsLoading(false);
    };

    fetchUser();
  }, [user, location.pathname]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isLoading && !user && !isOnAuthPage) {
    return <Navigate to="/authentication/login" />;
  }

  if (user && !user.emailVerified && location.pathname !== "/authentication/verify-email") {
    return <Navigate to="/authentication/verify-email" />;
  }

  if (user && user.emailVerified && location.pathname == "/authentication/verify-email") {
    return <Navigate to="/" />;
  }

  if (
    user &&
    user.emailVerified &&
    !user.profileComplete &&
    !location.pathname.includes("/authentication/profile")
  ) {
    return <Navigate to={`/authentication/profile/${user.id}`} />;
  }

  if (
    user &&
    user.emailVerified &&
    user.profileComplete &&
    location.pathname.includes("/authentication/profile")
  ) {
    return <Navigate to="/" />;
  }

  if (user && isOnAuthPage) {
    return <Navigate to="/" />;
  }

  return (
    <AuthenticationContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        setUser,
      }}
    >
      <Outlet />
    </AuthenticationContext.Provider>
  );
}
