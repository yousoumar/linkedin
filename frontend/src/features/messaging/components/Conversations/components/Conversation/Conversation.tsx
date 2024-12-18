import { useNavigate, useParams } from "react-router-dom";
import { useAuthentication } from "../../../../../authentication/contexts/AuthenticationContextProvider";
import { IConversation } from "../../Conversations";
import classes from "./Conversation.module.scss";

interface ConversationItemProps {
  conversation: IConversation;
}

export function Conversation({ conversation }: ConversationItemProps) {
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
