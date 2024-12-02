import { CompatClient, Stomp } from "@stomp/stompjs";
import { createContext, ReactNode, useEffect, useState } from "react";

const WsContext = createContext<CompatClient | null>(null);

const Ws = ({ children }: { children: ReactNode }) => {
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);
  const [likes, setLikes] = useState<unknown[]>([]);
  const [comments, setComments] = useState<unknown[]>([]);

  useEffect(() => {
    // Configure and connect WebSocket
    const client = Stomp.client("ws://localhost:8080/ws"); // Replace with your backend URL

    client.connect({}, () => {
      console.log("Connected to WebSocket");

      // Subscribe to topics
      client.subscribe("/topic/likes", (message) => {
        if (message.body) setLikes((prev) => [...prev, message.body]);
      });

      client.subscribe("/topic/comments", (message) => {
        if (message.body) setComments((prev) => [...prev, message.body]);
      });
    });

    setStompClient(client);

    return () => {
      client.disconnect(() => console.log("Disconnected from WebSocket"));
    };
  }, []);

  const sendMessage = (destination, message) => {
    if (stompClient && stompClient.connected) {
      stompClient.send(`/app${destination}`, {}, message);
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  return (
    <WsContext.Provider value={stompClient}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <button onClick={() => sendMessage("/like", "I liked this post!")}>Send Like</button>
          <button onClick={() => sendMessage("/comment", "Nice post!")}>Send Comment</button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <ul>
            <h3>Likes</h3>
            {likes.map((like, index) => (
              <li key={index}>{like}</li>
            ))}
          </ul>

          <ul>
            <h3>Comments</h3>
            {comments.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        </div>
      </div>
      {children}
    </WsContext.Provider>
  );
};

export default Ws;
