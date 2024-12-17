import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  useAuthentication,
  User,
} from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { Message } from "../Messages/Messages";
import classes from "./Conversations.module.scss";

export interface Conversation {
  id: number;
  author: User;
  recipient: User;
  messages: Message[];
}

export function Conversations({
  conversations,
  selectedConversation,
  setSelectedConversation,
  setConversations,
}: {
  conversations: Conversation[];
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  selectedConversation: Conversation | null;
  setSelectedConversation: Dispatch<SetStateAction<Conversation | null>>;
}) {
  const { user } = useAuthentication();
  const websocketClient = useWebSocket();

  useEffect(() => {
    const subscription = websocketClient?.subscribe(
      `/topic/users/${user?.id}/conversations`,
      (message) => {
        const conversation = JSON.parse(message.body);
        setConversations((prevConversations) => {
          const index = prevConversations.findIndex((c) => c.id === conversation.id);
          if (index === -1) {
            if (conversation.author.id === user?.id) return prevConversations;
            return [conversation, ...prevConversations];
          }
          return prevConversations.map((c) => (c.id === conversation.id ? conversation : c));
        });
      }
    );
    return () => subscription?.unsubscribe();
  }, [conversations, setConversations, setSelectedConversation, user?.id, websocketClient]);

  useEffect(() => {
    setSelectedConversation((prevSelectedConversation) => {
      if (!prevSelectedConversation) {
        return null;
      }
      return conversations.find((c) => c.id === prevSelectedConversation.id) || null;
    });
  }, [conversations, selectedConversation, setSelectedConversation]);

  return (
    <div className={classes.root}>
      {conversations.map((conversation) => {
        return (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        );
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
  conversation: Conversation;
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation) => void;
}

function ConversationItem({
  conversation,
  selectedConversation,
  setSelectedConversation,
}: ConversationItemProps) {
  const { user } = useAuthentication();
  const conversationUserToDisplay =
    conversation.recipient.id === user?.id ? conversation.author : conversation.recipient;
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(
    conversation.messages.filter((message) => message.receiver.id === user?.id && !message.isRead)
      .length
  );

  useEffect(() => {
    if (selectedConversation === conversation) {
      setUnreadMessagesCount(0);
    } else {
      setUnreadMessagesCount(
        conversation.messages.filter(
          (message) => message.receiver.id === user?.id && !message.isRead
        ).length
      );
    }
  }, [selectedConversation, conversation, user?.id]);

  return (
    <button
      key={conversation.id}
      className={`${classes.conversation} ${
        selectedConversation === conversation ? classes.selected : ""
      }`}
      onClick={() => {
        setSelectedConversation(conversation);
        setUnreadMessagesCount(0);
      }}
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
