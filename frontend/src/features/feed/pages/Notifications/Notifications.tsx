import { useEffect, useState } from "react";
import { request } from "../../../../utils/api";
import { User } from "../../../authentication/contexts/AuthenticationContextProvider";
import classes from "./Notifications.module.scss";

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
}
export interface Notification {
  id: number;
  recipient: User;
  actor: User;
  isRead: boolean;
  type: NotificationType;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      await request<Notification[]>({
        endpoint: "/api/v1/notifications",
        onSuccess: setNotifications,
        onFailure: (error) => console.log(error),
      });
    };

    fetchNotifications();
  }, []);
  return (
    <div className={classes.root}>
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
      {notifications.length === 0 && <p>No notifications</p>}
    </div>
  );
}

function Notification({ notification }: { notification: Notification }) {
  return (
    <div className={classes.notification}>
      <img src={notification.actor.profilePicture} alt="" className={classes.avatar} />
      <p>
        <strong>{notification.actor.firstName + " " + notification.actor.lastName}</strong>{" "}
        {notification.type === NotificationType.LIKE ? "liked" : "commented on"} your post.
      </p>
    </div>
  );
}
