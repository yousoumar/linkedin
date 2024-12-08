import { Outlet } from "react-router-dom";
import { WebSocketContextProvider } from "../../features/ws/WebSocketContextProvider";
import { Header } from "../Header/Header";
import classes from "./ApplicationLayout.module.scss";
export function ApplicationLayout() {
  return (
    <WebSocketContextProvider>
      <div className={classes.root}>
        <Header />
        <main className={classes.container}>
          <Outlet />
        </main>
      </div>
    </WebSocketContextProvider>
  );
}
