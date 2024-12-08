import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { User } from "../../../authentication/contexts/AuthenticationContextProvider";
import { LeftSidebar } from "../../components/LeftSidebar/LeftSidebar";
import { RightSidebar } from "../../components/RightSidebar/RightSidebar";
import { TimeAgo } from "../../components/TimeAgo/TimeAgo";
import classes from "./Notifications.module.scss";

enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
}
export interface Notification {
  id: number;
  recipient: User;
  actor: User;
  read: boolean;
  type: NotificationType;
  resourceId: number;
  creationDate: string;
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
      <div className={classes.left}>
        <LeftSidebar />
      </div>
      <div className={classes.center}>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            setNotifications={setNotifications}
          />
        ))}
        {notifications.length === 0 && (
          <p
            style={{
              padding: "1rem",
            }}
          >
            No notifications
          </p>
        )}
      </div>
      <div className={classes.right}>
        <RightSidebar />
      </div>
    </div>
  );
}

function Notification({
  notification,
  setNotifications,
}: {
  notification: Notification;

  setNotifications: Dispatch<SetStateAction<Notification[]>>;
}) {
  const navigate = useNavigate();
  
  function markNotificationAsRead(notificationId: number) {
    request({
      endpoint: `/api/v1/notifications/${notificationId}`,
      method: "PUT",
      onSuccess: () => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? { ...notification, isRead: true } : notification
          )
        );
      },
      onFailure: (error) => console.log(error),
    });
  }
  return (
    <button
      onClick={() => {
        markNotificationAsRead(notification.id);
        navigate(`/posts/${notification.resourceId}`);
      }}
      className={
        notification.read ? classes.notification : `${classes.notification} ${classes.unread}`
      }
    >
      <img src={notification.actor.profilePicture} alt="" className={classes.avatar} />

      <p
        style={{
          marginRight: "auto",
        }}
      >
        <strong>{notification.actor.firstName + " " + notification.actor.lastName}</strong>{" "}
        {notification.type === NotificationType.LIKE ? "liked" : "commented on"} your post.
      </p>
      <TimeAgo date={notification.creationDate} />
    </button>
  );
}
