import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/Input/Input";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { Box } from "../../components/Box/Box";
import classes from "./VerifyEmail.module.scss";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../contexts/AuthenticationContextProvider";

export function VerifyEmail() {
  const [errorMessage, setErrorMessage] = useState("");
  const { user, setUser } = useAuthentication();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  usePageTitle("Verify Email");
  const navigate = useNavigate();

  const validateEmail = async (code: string) => {
    setMessage("");
    await request<void>({
      endpoint: `/api/v1/authentication/validate-email-verification-token?token=${code}`,
      method: "PUT",
      onSuccess: () => {
        setErrorMessage("");
        setUser({ ...user!, emailVerified: true });
        navigate("/");
      },
      onFailure: (error) => {
        setErrorMessage(error);
      },
    });
    setIsLoading(false);
  };

  const sendEmailVerificationToken = async () => {
    setErrorMessage("");

    await request<void>({
      endpoint: `/api/v1/authentication/send-email-verification-token`,
      onSuccess: () => {
        setErrorMessage("");
        setMessage("Code sent successfully. Please check your email.");
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
        <h1>Verify your Email</h1>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            const code = e.currentTarget.code.value;
            await validateEmail(code);
            setIsLoading(false);
          }}
        >
          <p>Only one step left to complete your registration. Verify your email address.</p>
          <Input type="text" label="Verification code" key="code" name="code" />
          {message ? <p style={{ color: "green" }}>{message}</p> : null}
          {errorMessage ? <p style={{ color: "red" }}>{errorMessage}</p> : null}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "..." : "Validate email"}
          </Button>
          <Button
            outline
            type="button"
            onClick={() => {
              sendEmailVerificationToken();
            }}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Send again"}
          </Button>
        </form>
      </Box>
    </div>
  );
}
