import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ApplicationLayout } from "./components/ApplicationLayout/ApplicationLayout";
import { AuthenticationLayout } from "./features/authentication/components/AuthenticationLayout/AuthenticationLayout";
import { AuthenticationContextProvider } from "./features/authentication/contexts/AuthenticationContextProvider";
import { Login } from "./features/authentication/pages/Login/Login";
import { Profile } from "./features/authentication/pages/Profile/Profile";
import { ResetPassword } from "./features/authentication/pages/ResetPassword/ResetPassword";
import { Signup } from "./features/authentication/pages/Signup/Signup";
import { VerifyEmail } from "./features/authentication/pages/VerifyEmail/VerifyEmail";
import { Feed } from "./features/feed/pages/Feed/Feed";
import { Notifications } from "./features/feed/pages/Notifications/Notifications";
import { PostPage } from "./features/feed/pages/Post/Post";
import { Conversation } from "./features/messaging/pages/Conversation/Conversation";
import { Messaging } from "./features/messaging/pages/Messages/Messaging";
import "./index.scss";

const router = createBrowserRouter([
  {
    element: <AuthenticationContextProvider />,
    children: [
      {
        path: "/",
        element: <ApplicationLayout />,
        children: [
          {
            index: true,
            element: <Feed />,
          },
          {
            path: "posts/:id",
            element: <PostPage />,
          },
          {
            path: "network",
            element: <div>Network</div>,
          },
          {
            path: "jobs",
            element: <div>Jobs</div>,
          },
          {
            path: "messaging",
            element: <Messaging />,
            children: [
              {
                path: "conversations/:id",
                element: <Conversation />,
              },
            ],
          },
          {
            path: "notifications",
            element: <Notifications />,
          },
          {
            path: "profile/:id",
            element: <div>Profile</div>,
          },
          {
            path: "settings",
            element: <div>Settings & Privacy</div>,
          },
        ],
      },
      {
        path: "/authentication",
        element: <AuthenticationLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "signup",
            element: <Signup />,
          },
          {
            path: "request-password-reset",
            element: <ResetPassword />,
          },
          {
            path: "verify-email",
            element: <VerifyEmail />,
          },
          {
            path: "profile/:id",
            element: <Profile />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
