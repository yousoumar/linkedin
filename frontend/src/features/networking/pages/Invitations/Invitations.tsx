import { useEffect, useState } from "react";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { Connection, IConnection } from "../../components/Connection/Connection";
import { Title } from "../../components/Title/Title";
import classes from "./Invitations.module.scss";
export function Invitations() {
  const [connexions, setConnections] = useState<IConnection[]>([]);
  const [sent, setSent] = useState(false);
  const { user } = useAuthentication();
  const filtredConnections = sent
    ? connexions.filter((c) => c.author.id === user?.id)
    : connexions.filter((c) => c.recipient.id === user?.id);
  const ws = useWebSocket();

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections?status=PENDING",
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, [user?.id]);

  useEffect(() => {
    const subscription = ws?.subscribe("/topic/users/" + user?.id + "/connections/new", (data) => {
      const connection = JSON.parse(data.body);
      setConnections((connections) => [connection, ...connections]);
    });

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(
      "/topic/users/" + user?.id + "/connections/accepted",
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => connections.filter((c) => c.id !== connection.id));
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(
      "/topic/users/" + user?.id + "/connections/remove",
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => connections.filter((c) => c.id !== connection.id));
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  return (
    <div className={classes.connections}>
      <Title>Invitations ({connexions.length})</Title>
      <div className={classes.header}>
        <button className={!sent ? classes.active : ""} onClick={() => setSent(false)}>
          Received
        </button>
        <button className={sent ? classes.active : ""} onClick={() => setSent(true)}>
          Sent
        </button>
      </div>
      {filtredConnections.map((connection) => (
        <Connection
          key={connection.id}
          connection={connection}
          user={user}
          setConnections={setConnections}
        />
      ))}
      {filtredConnections.length === 0 && (
        <div className={classes.empty}>No invitation {sent ? "sent" : "received"} yet.</div>
      )}
    </div>
  );
}
