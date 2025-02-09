import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthentication } from "../contexts/AuthenticationContextProvider";

const GOOGLE_OAUTH2_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const VITE_GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL;

export function useOauth(page: "login" | "signup") {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { ouathLogin } = useAuthentication();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const [isOauthInProgress, setIsOauthInProgress] = useState(code !== null || error !== null);
  const [oauthError, setOauthError] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (error) {
        if (error === "access_denied") {
          setOauthError("You denied access to your Google account.");
        } else {
          setOauthError("An unknown error occurred.");
        }
        setIsOauthInProgress(false);
        setSearchParams({});
        return;
      }

      if (!code || !state) return;

      const { destination, antiForgeryToken } = JSON.parse(state);

      if (antiForgeryToken !== "n6kibcv2ov") {
        setOauthError("Invalid state parameter.");
        setIsOauthInProgress(false);
        setSearchParams({});
        return;
      }

      try {
        setTimeout(async () => {
          await ouathLogin(code, page);
          setIsOauthInProgress(false);
          setSearchParams({});
          navigate(destination || "/");
        }, 1000);
      } catch (error) {
        if (error instanceof Error) {
          setOauthError(error.message);
        } else {
          setOauthError("An unknown error occurred.");
        }
        setIsOauthInProgress(false);
        setSearchParams({});
      }
    }
    fetchData();
  }, [code, error, navigate, ouathLogin, page, setSearchParams, state]);

  return {
    isOauthInProgress,
    oauthError,
    startOauth: () => {
      const redirectUri = `${window.location.origin}/authentication/${page}`;
      window.location.href = `${VITE_GOOGLE_OAUTH_URL}?client_id=${GOOGLE_OAUTH2_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid+email+profile&response_type=code&state=${JSON.stringify(
        { antiForgeryToken: "n6kibcv2ov", destination: location.state?.from || "/" }
      )}`;
    },
  };
}
