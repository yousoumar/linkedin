import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useRef, useState } from "react";
import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/Input/Input";
import classes from "./Modal.module.scss";
interface IPostingMadalProps {
  showModal: boolean;
  content?: string;
  picture?: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onSubmit: (data: FormData) => Promise<void>;
  title: string;
}
export function Madal({
  setShowModal,
  showModal,
  onSubmit,
  content,
  picture,
  title,
}: IPostingMadalProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(picture);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [file, setFile] = useState<File | undefined>();

  if (!showModal) return null;

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const content = e.currentTarget.content.value;
    const formData = new FormData();

    if (file) {
      formData.append("picture", file);
    }

    if (!content) {
      setError("Content is required");
      setIsLoading(false);
      return;
    }

    formData.append("content", content);

    try {
      await onSubmit(formData);
      setPreview(undefined);
      setShowModal(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <h3 className={classes.title}>{title}</h3>
          <button className={classes.close} onClick={() => setShowModal(false)}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={classes.body}>
            <textarea
              placeholder="What do you want to talk about?"
              onFocus={() => setError("")}
              onChange={() => setError("")}
              name="content"
              ref={textareaRef}
              defaultValue={content}
            />
            {!preview ? (
              <Input
                onFocus={() => setError("")}
                accept="image/*"
                onChange={(e) => handleImageChange(e)}
                placeholder="Image URL (optional)"
                name="picture"
                type="file"
                style={{
                  marginBlock: 0,
                }}
              />
            ) : (
              <div className={classes.preview}>
                <button
                  className={classes.cancel}
                  type="button"
                  onClick={() => {
                    setPreview(undefined);
                  }}
                >
                  X
                </button>
                <img src={preview} alt="Preview" className={classes.preview} />
              </div>
            )}
          </div>
          {error && <div className={classes.error}>{error}</div>}
          <div className={classes.footer}>
            <Button size="medium" type="submit" disabled={isLoading}>
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
