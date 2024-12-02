import { Outlet } from "react-router-dom";
import Ws from "../../features/ws/context/Ws";
import { Header } from "../Header/Header";
import classes from "./ApplicationLayout.module.scss";
export function ApplicationLayout() {
  return (
    <Ws>
      <div className={classes.root}>
        <Header />

        <main className={classes.container}>
          <Outlet />
        </main>
      </div>
    </Ws>
  );
}
