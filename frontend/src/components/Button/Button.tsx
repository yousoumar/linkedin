import { ButtonHTMLAttributes } from "react";
import classes from "./Button.module.scss";
interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  outline?: boolean;
  size?: "small" | "medium" | "large";
}
export function Button({ outline, children, className, size = "large", ...others }: IButtonProps) {
  return (
    <button
      {...others}
      className={`${classes.button} ${classes[size]} ${
        outline ? classes.outline : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
