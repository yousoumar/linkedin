import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/Button/Button.tsx";
import { Input } from "../../../../components/Input/Input.tsx";
import { Loader } from "../../../../components/Loader/Loader.tsx";
import { usePageTitle } from "../../../../hooks/usePageTitle.tsx";
import { Box } from "../../components/Box/Box";
import { Seperator } from "../../components/Seperator/Seperator";
import { useAuthentication } from "../../contexts/AuthenticationContextProvider.tsx";
import { useOauth } from "../../hooks/useOauth.ts";
import classes from "./Signup.module.scss";

export function Signup() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthentication();
  const navigate = useNavigate();
  usePageTitle("Signup");
  const { isOauthInProgress, oauthError, startOauth } = useOauth("signup");
  const doSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    try {
      await signup(email, password);
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isOauthInProgress) {
    return <Loader isInline />;
  }

  return (
    <div className={classes.root}>
      <Box>
        <h1>Sign up</h1>
        <p>Make the most of your professional life.</p>
        <form onSubmit={doSignup}>
          <Input type="email" id="email" label="Email" onFocus={() => setErrorMessage("")} />

          <Input
            label="Password"
            type="password"
            id="password"
            onFocus={() => setErrorMessage("")}
          />
          {errorMessage && <p className={classes.error}>{errorMessage}</p>}
          <p className={classes.disclaimer}>
            By clicking Agree & Join or Continue, you agree to LinkedIn's{" "}
            <a href="">User Agreement</a>, <a href="">Privacy Policy</a>, and{" "}
            <a href="">Cookie Policy</a>.
          </p>
          <Button disabled={isLoading} type="submit">
            Agree & Join
          </Button>
        </form>
        <Seperator>Or</Seperator>
        {oauthError && <p className={classes.error}>{oauthError}</p>}
        <Button
          outline
          onClick={() => {
            startOauth();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
          Continue with Google
        </Button>
        <div className={classes.register}>
          Already on LinkedIn? <Link to="/authentication/login">Sign in</Link>
        </div>
      </Box>
    </div>
  );
}
