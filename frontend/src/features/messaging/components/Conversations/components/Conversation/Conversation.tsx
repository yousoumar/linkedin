import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthentication } from "../../../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../../../ws/WebSocketContextProvider";
import { IConversation } from "../../Conversations";
import classes from "./Conversation.module.scss";

interface ConversationItemProps {
  conversation: IConversation;
}

export function Conversation(props: ConversationItemProps) {
  const { user } = useAuthentication();
  const navigate = useNavigate();
  const { id } = useParams();
  const ws = useWebSocket();
  const [conversation, setConversation] = useState<IConversation>(props.conversation);

  const conversationUserToDisplay =
    conversation.recipient.id === user?.id ? conversation.author : conversation.recipient;
  const unreadMessagesCount = conversation.messages.filter(
    (message) => message.receiver.id === user?.id && !message.isRead
  ).length;

  useEffect(() => {
    const subscription = ws?.subscribe(
      `/topic/conversations/${conversation.id}/messages`,
      (data) => {
        const message = JSON.parse(data.body);
        setConversation((prevConversation) => {
          const index = prevConversation.messages.findIndex((m) => m.id === message.id);
          if (index == -1) {
            return {
              ...prevConversation,
              messages: [...prevConversation.messages, message],
            };
          }

          return {
            ...prevConversation,
            messages: prevConversation.messages.map((m) => (m.id === message.id ? message : m)),
          };
        });
        return () => subscription?.unsubscribe();
      }
    );
  }, [conversation?.id, ws]);

  return (
    <button
      key={conversation.id}
      className={`${classes.root} ${id && Number(id) === conversation.id ? classes.selected : ""}`}
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
