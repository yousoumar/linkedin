import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { IUser } from "../../../authentication/contexts/AuthenticationContextProvider";
import { IConnection } from "../../../networking/components/Connection/Connection";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import classes from "./LeftSidebar.module.scss";
interface ILeftSidebarProps {
  user: IUser | null;
}
export function LeftSidebar({ user }: ILeftSidebarProps) {
  const [connections, setConnections] = useState<IConnection[]>([]);
  const ws = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    request<IConnection[]>({
      endpoint: "/api/v1/networking/connections?userId=" + user?.id,
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, [user?.id]);

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
          src={
            user?.coverPicture
              ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.coverPicture}`
              : "/cover.jpeg"
          }
          alt="Cover"
        />
      </div>
      <button className={classes.avatar} onClick={() => navigate("/profile/" + user?.id)}>
        <img
          src={
            user?.profilePicture
              ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.profilePicture}`
              : "/avatar.svg"
          }
          alt=""
        />
      </button>
      <div className={classes.name}>{user?.firstName + " " + user?.lastName}</div>
      <div className={classes.title}>{user?.position + " at " + user?.company}</div>
      <div className={classes.info}>
        {/* <div className={classes.item}>
          <div className={classes.label}>Profile viewers</div>
          <div className={classes.value}>0</div>
        </div> */}
        <button className={classes.item} onClick={() => navigate("/network/connections")}>
          <span className={classes.label}>Connexions</span>
          <span className={classes.value}>
            {connections.filter((connection) => connection.status === "ACCEPTED").length}
          </span>
        </button>
      </div>
    </div>
  );
}
