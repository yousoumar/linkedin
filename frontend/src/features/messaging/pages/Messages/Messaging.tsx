import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { RightSidebar } from "../../../feed/components/RightSidebar/RightSidebar";
import { Conversations } from "../../components/Conversations/Conversations";
import classes from "./Messaging.module.scss";

export function Messaging() {
  usePageTitle("Messaging");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  const creatingNewConversation = location.pathname.includes("new");
  const onConversation = location.pathname.includes("conversations");
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.messaging}>
        <div
          className={classes.sidebar}
          style={{
            display: windowWidth >= 1024 || !creatingNewConversation ? "block" : "none",
          }}
        >
          <div className={classes.header}>
            <h1>Messaging</h1>
            <button
              onClick={() => {
                navigate("conversations/new");
              }}
              className={classes.new}
            >
              +
            </button>
          </div>
          <Conversations
            style={{
              display: onConversation && windowWidth < 1024 ? "none" : "block",
            }}
          />
        </div>

        <Outlet />
      </div>
      <div className={classes.adds}>
        <RightSidebar />
      </div>
    </div>
  );
}
