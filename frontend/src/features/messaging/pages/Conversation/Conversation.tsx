import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/Input/Input";
import { request } from "../../../../utils/api";
import {
  IUser,
  useAuthentication,
} from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { IConversation } from "../../components/Conversations/Conversations";
import { Messages } from "../../components/Messages/Messages";
import classes from "./Conversation.module.scss";
export function Conversation() {
  const [postingMessage, setPostingMessage] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [suggestingUsers, setSuggestingUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState<string>("");
  const [slectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const websocketClient = useWebSocket();
  const { id } = useParams();
  const navigate = useNavigate();
  const creatingNewConversation = id === "new";

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user } = useAuthentication();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (id == "new") {
      setConversation(null);
      request<IUser[]>({
        endpoint: "/api/v1/authentication/users",
        onSuccess: (data) => setSuggestingUsers(data),
        onFailure: (error) => console.log(error),
      });
    } else {
      request<IConversation>({
        endpoint: `/api/v1/messaging/conversations/${id}`,
        onSuccess: (data) => setConversation(data),
        onFailure: () => navigate("/messaging"),
      });
    }
  }, [id, navigate]);

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
          conversation?.recipient.id == user?.id
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
    await request<IConversation>({
      endpoint: "/api/v1/messaging/conversations",
      method: "POST",
      body: JSON.stringify(message),
      onSuccess: (conversation) => navigate(`/messaging/conversations/${conversation.id}`),
      onFailure: (error) => console.log(error),
    });
  }

  const conversationUserToDisplay =
    conversation?.recipient.id === user?.id ? conversation?.author : conversation?.recipient;
  return (
    <div className={classes.root}>
      {(conversation || creatingNewConversation) && (
        <>
          <div className={classes.header}>
            <button className={classes.back} onClick={() => navigate("/messaging")}>
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
                            navigate(`/messaging/conversations/${conversation.id}`);
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
