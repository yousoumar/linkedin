import { HTMLAttributes, useEffect, useState } from "react";
import { timeAgo } from "../../utils/date";
import classes from "./TimeAgo.module.scss";

interface ITimeAgoProps extends HTMLAttributes<HTMLDivElement> {
  date: string;
  edited?: boolean;
}

export function TimeAgo({ date, edited, className, ...others }: ITimeAgoProps) {
  const [time, setTime] = useState(timeAgo(new Date(date)));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(timeAgo(new Date(date)));
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className={`${classes.root} ${className ? className : ""}`} {...others}>
      <span>{time}</span>
      {edited ? <span> . Edited</span> : null}
    </div>
  );
}
