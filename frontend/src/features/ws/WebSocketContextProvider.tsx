import { CompatClient, Stomp } from "@stomp/stompjs";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const WsContext = createContext<CompatClient | null>(null);

export const useWebSocket = () => useContext(WsContext);

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);

  useEffect(() => {
    const client = Stomp.client(`${import.meta.env.VITE_API_URL}/ws`);

    client.connect(
      {},
      () => {
        console.log("Connected to WebSocket");
        setStompClient(client);
      },
      (error: unknown) => {
        console.error("Error connecting to WebSocket:", error);
      }
    );

    return () => {
      if (client.connected) {
        client.disconnect(() => console.log("Disconnected from WebSocket"));
      }
    };
  }, []);

  return <WsContext.Provider value={stompClient}>{children}</WsContext.Provider>;
};
