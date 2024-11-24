import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../../components/Input/Input";
import {
  useAuthentication,
  User,
} from "../../../authentication/contexts/AuthenticationContextProvider";
import { timeAgo } from "../../utils/date";
import classes from "./Comment.module.scss";

export interface Comment {
  id: number;
  content: string;
  author: User;
  creationDate: string;
  updatedDate?: string;
}

interface CommentProps {
  comment: Comment;
  deleteComment: (commentId: number) => Promise<void>;
  editComment: (commentId: number, content: string) => Promise<void>;
}

export function Comment({ comment, deleteComment, editComment }: CommentProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [commentContent, setCommentContent] = useState(comment.content);
  const { user } = useAuthentication();
  return (
    <div key={comment.id} className={classes.root}>
      {!editing ? (
        <>
          <div className={classes.header}>
            <button
              onClick={() => {
                navigate(`/profile/${comment.author.id}`);
              }}
              className={classes.author}
            >
              <img
                className={classes.avatar}
                src={comment.author.profilePicture || "/avatar.png"}
                alt=""
              />
              <div>
                <div className={classes.name}>
                  {comment.author.firstName + " " + comment.author.lastName}
                </div>
                <div className={classes.title}>
                  {comment.author.position + " at " + comment.author.company}
                </div>
                <div className={classes.date}>
                  {timeAgo(new Date(comment.updatedDate || comment.creationDate))}
                  {comment.updatedDate ? " . Edited " : ""}
                </div>
              </div>
            </button>
            {comment.author.id == user?.id && (
              <button
                className={`${classes.action} ${showActions ? classes.active : ""}`}
                onClick={() => setShowActions(!showActions)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
                  <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
                </svg>
              </button>
            )}

            {showActions && (
              <div className={classes.actions}>
                <button onClick={() => setEditing(true)}>Edit</button>
                <button onClick={() => deleteComment(comment.id)}>Delete</button>
              </div>
            )}
          </div>
          <div className={classes.content}>{comment.content}</div>
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await editComment(comment.id, commentContent);
            setEditing(false);
            setShowActions(false);
          }}
        >
          <Input
            type="text"
            value={commentContent}
            onChange={(e) => {
              setCommentContent(e.target.value);
            }}
            placeholder="Edit your comment"
          />
        </form>
      )}
    </div>
  );
}

export default Comment;
