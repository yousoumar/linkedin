import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AuthenticationContextProvider} from "./features/authentication/contexts/AuthenticationContextProvider";
import {Login} from "./features/authentication/pages/Login/Login";
import {ResetPassword} from "./features/authentication/pages/ResetPassword/ResetPassword";
import {Signup} from "./features/authentication/pages/Signup/Signup";
import {Feed} from "./features/feed/Feed";
import "./index.scss";
import {VerifyEmail} from "./features/authentication/pages/VerifyEmail/VerifyEmail.tsx";

const router = createBrowserRouter([
    {
        element: <AuthenticationContextProvider/>,
        children: [
            {
                path: "/",
                element: <Feed/>,
            },
            {
                path: "/login",
                element: <Login/>,
            },
            {
                path: "/signup",
                element: <Signup/>,
            },
            {
                path: "/request-password-reset",
                element: <ResetPassword/>,
            },
            {
                path: "/verify-email",
                element: <VerifyEmail/>,
            }
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>
);
