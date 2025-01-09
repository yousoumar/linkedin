import { Dispatch, SetStateAction, useEffect } from "react";
import { Button } from "../../../../components/Button/Button";
import { request } from "../../../../utils/api";
import { IUser } from "../../../authentication/contexts/AuthenticationContextProvider";

import { useNavigate } from "react-router-dom";
import classes from "./Connection.module.scss";

export enum Status {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export interface IConnection {
  id: number;
  author: IUser;
  recipient: IUser;
  status: Status;
  connectionDate: string;
  seen: boolean;
}

interface IConnectionProps {
  connection: IConnection;
  user: IUser | null;
  setConnections: Dispatch<SetStateAction<IConnection[]>>;
}

export function Connection({ connection, user, setConnections }: IConnectionProps) {
  const navigate = useNavigate();
  const userToDisplay =
    connection.author.id === user?.id ? connection.recipient : connection.author;

  useEffect(() => {
    if (connection.recipient.id === user?.id) {
      request<void>({
        endpoint: `/api/v1/networking/connections/${connection.id}/seen`,
        method: "PUT",
        onSuccess: () => {},
        onFailure: (error) => console.log(error),
      });
    }
  }, [connection.id, connection.recipient.id, setConnections, user?.id]);

  return (
    <div key={connection.id} className={classes.connection}>
      <button onClick={() => navigate("/profile/" + userToDisplay.id)}>
        <img
          className={classes.avatar}
          src={userToDisplay.profilePicture || "/avatar.svg"}
          alt=""
        />
      </button>
      <button onClick={() => navigate("/profile/" + userToDisplay.id)}>
        <h3 className={classes.name}>{userToDisplay?.firstName + " " + userToDisplay.lastName}</h3>
        <p>
          {userToDisplay?.position} at {userToDisplay?.company}
        </p>
      </button>
      <div className={classes.actions}>
        {connection.status === Status.ACCEPTED ? (
          <Button
            size="small"
            outline
            className={classes.action}
            onClick={() => {
              request<IConnection>({
                endpoint: `/api/v1/networking/connections/${connection.id}`,
                method: "DELETE",
                onSuccess: () => {
                  setConnections((connections) =>
                    connections.filter((c) => c.id !== connection.id)
                  );
                },
                onFailure: (error) => console.log(error),
              });
            }}
          >
            Remove
          </Button>
        ) : (
          <>
            <Button
              size="small"
              outline
              className={classes.action}
              onClick={() => {
                request<IConnection>({
                  endpoint: `/api/v1/networking/connections/${connection.id}`,
                  method: "DELETE",
                  onSuccess: () => {
                    setConnections((connections) =>
                      connections.filter((c) => c.id !== connection.id)
                    );
                  },
                  onFailure: (error) => console.log(error),
                });
              }}
            >
              {user?.id === connection.author.id ? "Cancel" : "Ignore"}
            </Button>
            {user?.id === connection.recipient.id && (
              <Button
                size="small"
                className={classes.action}
                onClick={() => {
                  request<IConnection>({
                    endpoint: `/api/v1/networking/connections/${connection.id}`,
                    method: "PUT",
                    onSuccess: () => {
                      setConnections((connections) =>
                        connections.filter((c) => c.id !== connection.id)
                      );
                    },
                    onFailure: (error) => console.log(error),
                  });
                }}
              >
                Accept
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
