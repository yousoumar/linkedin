import { Outlet } from "react-router-dom";
import { Header } from "../Header/Header";
import classes from "./ApplicationLayout.module.scss";
export function ApplicationLayout() {
  return (
    <div className={classes.root}>
      <Header />
      <main className={classes.container}>
        <Outlet />
      </main>
    </div>
  );
}
