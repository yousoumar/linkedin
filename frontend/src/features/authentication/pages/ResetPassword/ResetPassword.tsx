import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/Input/Input";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { request } from "../../../../utils/api";
import { Box } from "../../components/Box/Box";
import classes from "./ResetPassword.module.scss";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ResetPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  usePageTitle("Reset Password");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sendPasswordResetToken = async (email: string) => {
    await request<void>({
      endpoint: `/api/v1/authentication/send-password-reset-token?email=${email}`,
      method: "PUT",
      onSuccess: () => {
        setErrorMessage("");
        setEmailSent(true);
      },
      onFailure: (error) => {
        setErrorMessage(error);
      },
    });
    setIsLoading(false);
  };
  const navigate = useNavigate();

  const resetPassword = async (email: string, code: string, password: string) => {
    await request<void>({
      endpoint: `/api/v1/authentication/reset-password?email=${email}&token=${code}&newPassword=${password}`,
      method: "PUT",
      onSuccess: () => {
        setErrorMessage("");
        navigate("/login");
      },
      onFailure: (error) => {
        setErrorMessage(error);
      },
    });
    setIsLoading(false);
  };
  return (
    <div className={classes.root}>
      <Box>
        <h1>Reset Password</h1>

        {!emailSent ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const email = e.currentTarget.email.value;
              await sendPasswordResetToken(email);
              setEmail(email);
              setIsLoading(false);
            }}
          >
            <p>
              Enter your email and we’ll send a verification code if it matches an existing LinkedIn
              account.
            </p>
            <Input key="email" name="email" type="email" label="Email" />
            <p style={{ color: "red" }}>{errorMessage}</p>
            <Button type="submit" disabled={isLoading}>
              Next
            </Button>
            <Button
              outline
              onClick={() => {
                navigate("/");
              }}
              disabled={isLoading}
            >
              Back
            </Button>
          </form>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              const code = e.currentTarget.code.value;
              const password = e.currentTarget.password.value;
              await resetPassword(email, code, password);
              setIsLoading(false);
            }}
          >
            <p>Enter the verification code we sent to your email and your new password.</p>
            <Input type="text" label="Verification code" key="code" name="code" />
            <Input
              label="New password"
              name="password"
              key="password"
              type="password"
              id="password"
            />
            <p style={{ color: "red" }}>{errorMessage}</p>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "..." : "Reset Password"}
            </Button>
            <Button
              outline
              type="button"
              onClick={() => {
                setEmailSent(false);
                setErrorMessage("");
              }}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Back"}
            </Button>
          </form>
        )}
      </Box>
    </div>
  );
}
