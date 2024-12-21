import { useEffect, useRef } from "react";
import { request } from "../../../../../../utils/api";
import { IUser } from "../../../../../authentication/contexts/AuthenticationContextProvider";
import { TimeAgo } from "../../../../../feed/components/TimeAgo/TimeAgo";
import { IMessage } from "../../Messages";
import classes from "./Message.module.scss";

interface IMessageProps {
  message: IMessage;
  user: IUser | null;
}

export function Message({ message, user }: IMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!message.isRead && user?.id === message.receiver.id) {
      request<void>({
        endpoint: `/api/v1/messaging/conversations/messages/${message.id}`,
        method: "PUT",
        onSuccess: () => {},
        onFailure: (error) => console.log(error),
      });
    }
  }, [message.id, message.isRead, message.receiver.id, user?.id]);

  useEffect(() => {
    messageRef.current?.scrollIntoView();
  }, []);
  return (
    <div
      ref={messageRef}
      className={`${classes.root} ${
        message.sender.id === user?.id ? classes.sent : classes.received
      }`}
    >
      <div className={`${classes.message} `}>
        <div className={classes.top}>
          <img
            className={classes.avatar}
            src={message.sender.profilePicture || "/avatar.svg"}
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
          {!message.isRead ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
              </svg>
              <span>Sent</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
              </svg>
              <span>Read</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
