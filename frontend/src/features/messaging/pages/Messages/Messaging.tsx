import { useEffect, useState } from "react";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { RightSidebar } from "../../../feed/components/RightSidebar/RightSidebar";
import { Conversation as ConversationDetails } from "../../components/Conversation/Conversation";
import { Conversation, Conversations } from "../../components/Conversations/Conversations";
import classes from "./Messaging.module.scss";

export function Messaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [creatingNewConversation, setCreatingNewConversation] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { user } = useAuthentication();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    request<Conversation[]>({
      endpoint: "/api/v1/messaging/conversations",
      onSuccess: (data) => setConversations(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.messaging}>
        {(windowWidth >= 1024 || (!selectedConversation && !creatingNewConversation)) && (
          <div className={classes.sidebar}>
            <div className={classes.header}>
              <h1>Messaging</h1>
              <button
                onClick={() => {
                  setCreatingNewConversation(true);
                  setSelectedConversation(null);
                }}
                className={classes.new}
              >
                +
              </button>
            </div>
            <Conversations
              setConversations={setConversations}
              conversations={conversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
            />
          </div>
        )}
        <ConversationDetails
          conversations={conversations}
          creatingNewConversation={creatingNewConversation}
          setCreatingNewConversation={setCreatingNewConversation}
          setConversations={setConversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          user={user!}
          windowWidth={windowWidth}
        />
      </div>
      <div className={classes.adds}>
        <RightSidebar />
      </div>
    </div>
  );
}
