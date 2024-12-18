import { useEffect } from "react";
import { request } from "../../../../../../utils/api";
import { IUser } from "../../../../../authentication/contexts/AuthenticationContextProvider";
import { TimeAgo } from "../../../../../feed/components/TimeAgo/TimeAgo";
import { IMessage } from "../../Messages";
import classes from "./Message.module.scss";

interface IMessageProps {
  message: IMessage;
  user: IUser | null;
  conversationId: number;
}

export function Message({ message, user, conversationId }: IMessageProps) {
  useEffect(() => {
    if (!message.isRead && user?.id === message.receiver.id) {
      request<void>({
        endpoint: `/api/v1/messaging/conversations/messages/${message.id}`,
        method: "PUT",
        onSuccess: () => {},
        onFailure: (error) => console.log(error),
      });
    }
  }, [message.id, message.isRead, message.receiver.id, user?.id, conversationId]);

  console.log(message);
  return (
    <div
      className={`${classes.root} ${
        message.sender.id === user?.id ? classes.sent : classes.received
      }`}
    >
      <div className={`${classes.message} `}>
        <div className={classes.top}>
          <img
            className={classes.avatar}
            src={message.sender.profilePicture}
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
          />
          <div>
            <div className={classes.name}>
              {message.sender.firstName} {message.sender.lastName}
            </div>

            <TimeAgo date={message.createdAt} className={classes.time} />
          </div>
        </div>
        <div className={classes.content}>{message.content}</div>
      </div>
      {message.sender.id == user?.id && (
        <div className={classes.status}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
          </svg>
          <span>{message.isRead ? "Read" : "Sent"}</span>
        </div>
      )}
    </div>
  );
}
