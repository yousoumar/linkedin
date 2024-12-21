import { IUser } from "../../../authentication/contexts/AuthenticationContextProvider";
import classes from "./Messages.module.scss";
import { Message } from "./components/Message/Message";

export interface IMessage {
  id: number;
  sender: IUser;
  receiver: IUser;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface IMessagesProps {
  messages: IMessage[];
  user: IUser | null;
}

export function Messages({ messages, user }: IMessagesProps) {
  return (
    <div className={classes.root}>
      {messages.map((message) => (
        <Message key={message.id} message={message} user={user} />
      ))}
    </div>
  );
}
