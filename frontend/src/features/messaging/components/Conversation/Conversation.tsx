import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/Input/Input";
import { request } from "../../../../utils/api";
import { User } from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import type { Conversation } from "../Conversations/Conversations";
import { Messages } from "../Messages/Messages";
import classes from "./Conversation.module.scss";

interface ConversationProps {
  selectedConversation: Conversation | null;
  setSelectedConversation: Dispatch<SetStateAction<Conversation | null>>;
  user: User;
  windowWidth: number;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  conversations: Conversation[];
  creatingNewConversation: boolean;
  setCreatingNewConversation: Dispatch<SetStateAction<boolean>>;
}

export function Conversation({
  selectedConversation,
  setSelectedConversation,
  user,
  windowWidth,
  creatingNewConversation,
  setCreatingNewConversation,
  setConversations,
  conversations,
}: ConversationProps) {
  const [postingMessage, setPostingMessage] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [suggestingUsers, setSuggestingUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [slectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(selectedConversation);
  const websocketClient = useWebSocket();

  useEffect(() => {
    setConversation(selectedConversation);
  }, [selectedConversation]);

  useEffect(() => {
    request<User[]>({
      endpoint: "/api/v1/authentication/users",
      onSuccess: (data) => setSuggestingUsers(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    const subscription = websocketClient?.subscribe(
      `/topic/conversations/${conversation?.id}/messages`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        setConversation((prevConversation) => {
          return {
            ...prevConversation!,
            messages: [...prevConversation!.messages, newMessage],
          };
        });
      }
    );
    return () => subscription?.unsubscribe();
  }, [conversation?.id, websocketClient]);

  async function addMessageToConversation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPostingMessage(true);
    await request<void>({
      endpoint: `/api/v1/messaging/conversations/${conversation?.id}/messages`,
      method: "POST",
      body: JSON.stringify({
        receiverId:
          conversation?.recipient.id == user.id
            ? conversation?.author.id
            : conversation?.recipient.id,
        content,
      }),
      onSuccess: () => {},
      onFailure: (error) => console.log(error),
    });
    setPostingMessage(false);
  }

  async function createConversationWithMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const message = {
      receiverId: slectedUser?.id,
      content,
    };
    console.log(message);
    await request<Conversation>({
      endpoint: "/api/v1/messaging/conversations",
      method: "POST",
      body: JSON.stringify(message),
      onSuccess: (conversation) => {
        setSelectedConversation(conversation);
        setConversations((prevConversations) => [conversation, ...prevConversations]);
        setCreatingNewConversation(false);
      },
      onFailure: (error) => console.log(error),
    });
  }

  const conversationUserToDisplay =
    conversation?.recipient.id === user.id ? conversation.author : conversation?.recipient;
  return (
    <div className={classes.root}>
      {(conversation || creatingNewConversation) && (
        <>
          <div className={classes.header}>
            <button
              className={classes.back}
              onClick={() => {
                setSelectedConversation(null);
                setCreatingNewConversation(false);
              }}
            >
              {"<"}
            </button>
          </div>
          {conversation && (
            <div className={classes.top}>
              <img
                className={classes.avatar}
                src={conversationUserToDisplay?.profilePicture}
                alt=""
              />
              <div>
                <div className={classes.name}>
                  {conversationUserToDisplay?.firstName} {conversationUserToDisplay?.lastName}
                </div>
                <div className={classes.title}>
                  {conversationUserToDisplay?.position} at {conversationUserToDisplay?.company}
                </div>
              </div>
            </div>
          )}
          {!conversation && creatingNewConversation && (
            <form className={`${classes.form} ${classes.new}`} onSubmit={(e) => e.preventDefault()}>
              <p>Starting a new conversation {slectedUser && "with:"}</p>
              {!slectedUser && (
                <Input
                  type="text"
                  name="recipient"
                  placeholder="Type a name"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              )}

              {slectedUser && (
                <div className={classes.top}>
                  <img className={classes.avatar} src={slectedUser.profilePicture} alt="" />
                  <div>
                    <div className={classes.name}>
                      {slectedUser.firstName} {slectedUser.lastName}
                    </div>
                    <div className={classes.title}>
                      {slectedUser.position} at {slectedUser.company}
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className={classes.close}>
                    X
                  </button>
                </div>
              )}

              {!slectedUser && !conversation && (
                <div className={classes.suggestions}>
                  {suggestingUsers
                    .filter(
                      (user) => user.firstName?.includes(search) || user.lastName?.includes(search)
                    )
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          const conversation = conversations.find(
                            (c) => c.recipient.id === user.id || c.author.id === user.id
                          );
                          if (conversation) {
                            setSelectedConversation(conversation);
                            setCreatingNewConversation(false);
                          } else {
                            setSelectedUser(user);
                          }
                        }}
                      >
                        <img className={classes.avatar} src={user.profilePicture} alt="" />
                        <div>
                          <div className={classes.name}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className={classes.title}>
                            {user.position} at {user.company}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </form>
          )}
          {conversation ? (
            <Messages
              messages={conversation.messages}
              user={user}
              conversationId={conversation.id}
            />
          ) : (
            <div></div>
          )}
          <form
            className={classes.form}
            onSubmit={async (e) => {
              if (!content) return;
              if (conversation) {
                await addMessageToConversation(e);
              } else {
                await createConversationWithMessage(e);
              }
              setContent("");
              setSelectedUser(null);
            }}
          >
            <textarea
              onChange={(e) => setContent(e.target.value)}
              value={content}
              name="content"
              className={classes.textarea}
              placeholder="Write a message..."
            ></textarea>
            <Button size="medium" className={classes.send} disabled={postingMessage}>
              Send
            </Button>
          </form>
        </>
      )}
      {!conversation && !creatingNewConversation && windowWidth >= 1024 && (
        <div className={classes.welcome}>No conversation selected.</div>
      )}
    </div>
  );
}
