import classes from "./Loader.module.scss";
interface ILoaderProps {
  isInline?: boolean;
}
export function Loader({ isInline }: ILoaderProps) {
  if (isInline) {
    return (
      <div className={classes.inline}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }
  return (
    <div className={classes.global}>
      <img src="/logo.svg" alt="Loading..." />
      <div className={classes.container}>
        <div className={classes.content}></div>
      </div>
    </div>
  );
}
