import { useEffect, useState } from "react";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { IConnection } from "../../../networking/components/Connection/Connection";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import classes from "./LeftSidebar.module.scss";
export function LeftSidebar() {
  const { user } = useAuthentication();
  const [connections, setConnections] = useState<IConnection[]>([]);
  const ws = useWebSocket();

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections",
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    const subscription = ws?.subscribe(
      "/topic/users/" + user?.id + "/connections/accepted",
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => [...connections, connection]);
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
    <div className={classes.root}>
      <div className={classes.cover}>
        <img
          src="https://images.unsplash.com/photo-1727163941315-1cc29bb49e54?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Cover"
        />
      </div>
      <div className={classes.avatar}>
        <img src={user?.profilePicture || "/avatar.svg"} alt="" />
      </div>
      <div className={classes.name}>{user?.firstName + " " + user?.lastName}</div>
      <div className={classes.title}>{user?.position + " at " + user?.company}</div>
      <div className={classes.info}>
        <div className={classes.item}>
          <div className={classes.label}>Profile viewers</div>
          <div className={classes.value}>0</div>
        </div>
        <div className={classes.item}>
          <div className={classes.label}>Connexions</div>
          <div className={classes.value}>
            {connections.filter((connection) => connection.status === "ACCEPTED").length}
          </div>
        </div>
      </div>
    </div>
  );
}
