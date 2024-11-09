import { ButtonHTMLAttributes } from "react";
import classes from "./Button.module.scss";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  outline?: boolean;
};
export function Button({ outline, children, ...others }: ButtonProps) {
  return (
    <button {...others} className={`${classes.button} ${outline ? classes.outline : ""}`}>
      {children}
    </button>
  );
}
