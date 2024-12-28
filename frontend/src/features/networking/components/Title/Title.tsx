import { ReactNode } from "react";
import classes from "./Title.module.scss";
export function Title({ children }: { children: ReactNode }) {
  return <h2 className={classes.title}>{children}</h2>;
}
