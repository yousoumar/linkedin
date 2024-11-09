import { InputHTMLAttributes } from "react";
import classes from "./Input.module.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};
export function Input({ label, ...others }: InputProps) {
  return (
    <div className={classes.root}>
      {label ? (
        <label className={classes.label} htmlFor={others.id}>
          {label}
        </label>
      ) : null}
      <input {...others} />
    </div>
  );
}
