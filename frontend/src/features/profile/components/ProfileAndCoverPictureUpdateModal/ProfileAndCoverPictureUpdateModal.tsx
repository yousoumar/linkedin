import { ChangeEvent, RefObject } from "react";
import classes from "./ProfileAndCoverPictureUpdateModal.module.scss";

interface IProfilePictureModalProps {
  newPicturePreview: string | null;
  setNewPicturePreview: (value: string | null) => void;
  setNewPicture: (value: File | null) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  updatePicture: () => void;
  setEditingPicture: (value: boolean) => void;
  type: "profile" | "cover";
}

export function ProfileAndCoverPictureUpdateModal({
  newPicturePreview,
  setNewPicturePreview,
  setNewPicture,
  fileInputRef,
  handleFileChange,
  triggerFileInput,
  updatePicture,
  setEditingPicture,
  type,
}: IProfilePictureModalProps) {
  return (
    <div className={classes.modal}>
      <div className={classes.content}>
        <header>
          <h3>{type === "profile" ? "Changing profile picture" : "Changing cover picture"}</h3>
          <button onClick={() => setEditingPicture(false)}>X</button>
        </header>
        {type === "profile" ? (
          <div className={classes.avatar}>
            <img src={!newPicturePreview ? "/avatar.svg" : newPicturePreview} alt="" />
          </div>
        ) : (
          <div className={classes.cover}>
            <img src={!newPicturePreview ? "/cover.jpeg" : newPicturePreview} alt="" />
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*"
        />
        <div className={classes.actions}>
          <button
            onClick={() => {
              setNewPicturePreview(null);
              setNewPicture(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
            </svg>
          </button>
          <button onClick={triggerFileInput}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z" />
            </svg>
          </button>
          <button onClick={updatePicture}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
