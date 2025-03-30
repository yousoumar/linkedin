import { useState } from "react";
import { Input } from "../../../../components/Input/Input";
import { request } from "../../../../utils/api";
import { IUser } from "../../../authentication/contexts/AuthenticationContextProvider";
import classes from "./About.module.scss";

interface AboutProps {
  user: IUser | null;
  authUser: IUser | null;
  onUpdate: (updatedUser: IUser) => void;
}

export function About({ user, authUser, onUpdate }: AboutProps) {
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState(authUser?.about || "");

  async function updateAbout() {
    if (!user?.id) return;

    await request<IUser>({
      endpoint: `/api/v1/authentication/profile/${user.id}/info?about=${aboutInput}`,
      method: "PUT",
      onSuccess: (data) => {
        onUpdate(data);
        setEditingAbout(false);
      },
      onFailure: (error) => console.log(error),
    });
  }

  return (
    <div className={classes.about}>
      <div className={classes.header}>
        <h2>About</h2>
        {authUser?.id === user?.id && (
          <>
            {!editingAbout ? (
              <button className={classes.edit} onClick={() => setEditingAbout(!editingAbout)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z" />
                </svg>
              </button>
            ) : (
              <div className={classes.actions}>
                <button
                  onClick={() => {
                    setEditingAbout(false);
                    setAboutInput(user?.about || "");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                  </svg>
                </button>
                <button onClick={updateAbout}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {!editingAbout ? (
        <p>{user?.about ? user.about : "No information provided."}</p>
      ) : (
        <Input
          value={aboutInput}
          onChange={(e) => setAboutInput(e.target.value)}
          placeholder="Write something about yourself..."
        />
      )}
    </div>
  );
}
