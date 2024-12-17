import { useEffect } from "react";
import { request } from "../../../../utils/api";
import { User } from "../../../authentication/contexts/AuthenticationContextProvider";
import { TimeAgo } from "../../../feed/components/TimeAgo/TimeAgo";
import classes from "./Messages.module.scss";

export interface Message {
  id: number;
  sender: User;
  receiver: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface MessagesProps {
  messages: Message[];
  user: User | null;
  conversationId: number;
}

export function Messages({ messages, user, conversationId }: MessagesProps) {
  return (
    <div className={classes.root}>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          user={user}
          conversationId={conversationId}
        />
      ))}
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  user: User | null;
  conversationId: number;
}

export function MessageItem({ message, user, conversationId }: MessageItemProps) {
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
      className={`${classes.message} ${
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
