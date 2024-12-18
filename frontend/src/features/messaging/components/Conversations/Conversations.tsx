import { HTMLAttributes, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "../../../../utils/api";
import {
  IUser,
  useAuthentication,
} from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { IMessage } from "../Messages/Messages";
import classes from "./Conversations.module.scss";

export interface IConversation {
  id: number;
  author: IUser;
  recipient: IUser;
  messages: IMessage[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IConversationsProps extends HTMLAttributes<HTMLDivElement> {}

export function Conversations(props: IConversationsProps) {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const { user } = useAuthentication();
  const websocketClient = useWebSocket();

  useEffect(() => {
    request<IConversation[]>({
      endpoint: "/api/v1/messaging/conversations",
      onSuccess: (data) => setConversations(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    const subscription = websocketClient?.subscribe(
      `/topic/users/${user?.id}/conversations`,
      (message) => {
        const conversation = JSON.parse(message.body);
        console.log(conversation);
        setConversations((prevConversations) => {
          const index = prevConversations.findIndex((c) => c.id === conversation.id);
          if (index === -1) {
            return [conversation, ...prevConversations];
          }
          return prevConversations.map((c) => (c.id === conversation.id ? conversation : c));
        });
      }
    );
    return () => subscription?.unsubscribe();
  }, [user?.id, websocketClient]);

  return (
    <div className={classes.root} {...props}>
      {conversations.map((conversation) => {
        return <ConversationItem key={conversation.id} conversation={conversation} />;
      })}
      {conversations.length === 0 && (
        <div
          className={classes.welcome}
          style={{
            padding: "1rem",
          }}
        >
          No conversation to display.
        </div>
      )}
    </div>
  );
}

interface ConversationItemProps {
  conversation: IConversation;
}

function ConversationItem({ conversation }: ConversationItemProps) {
  const { user } = useAuthentication();
  const navigate = useNavigate();
  const { id } = useParams();
  const conversationUserToDisplay =
    conversation.recipient.id === user?.id ? conversation.author : conversation.recipient;
  const unreadMessagesCount = conversation.messages.filter(
    (message) => message.receiver.id === user?.id && !message.isRead
  ).length;

  return (
    <button
      key={conversation.id}
      className={`${classes.conversation} ${
        id && Number(id) === conversation.id ? classes.selected : ""
      }`}
      onClick={() => navigate(`/messaging/conversations/${conversation.id}`)}
    >
      <img className={classes.avatar} src={conversationUserToDisplay.profilePicture} alt="" />

      {unreadMessagesCount > 0 && <div className={classes.unread}>{unreadMessagesCount}</div>}

      <div>
        <div className={classes.name}>
          {conversationUserToDisplay.firstName} {conversationUserToDisplay.lastName}
        </div>
        <div className={classes.content}>
          {conversation.messages[conversation.messages.length - 1]?.content}
        </div>
      </div>
    </button>
  );
}
