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

  return (
    <div
      className={`${classes.root} ${
        message.sender.id === user?.id ? classes.sent : classes.received
      }`}
    >
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
  );
}
