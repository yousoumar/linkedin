import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../../components/Input/Input";
import { request } from "../../../../utils/api";
import {
  IUser,
  useAuthentication,
} from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/WebSocketContextProvider";
import { Comment, IComment } from "../Comment/Comment";
import { Madal } from "../Modal/Modal";
import { TimeAgo } from "../TimeAgo/TimeAgo";
import classes from "./Post.module.scss";

export interface IPost {
  id: number;
  content: string;
  author: IUser;
  picture?: string;
  creationDate: string;
  updatedDate?: string;
}

interface PostProps {
  post: IPost;
  setPosts: Dispatch<SetStateAction<IPost[]>>;
}

export function Post({ post, setPosts }: PostProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState<IUser[]>([]);
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthentication();
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const webSocketClient = useWebSocket();

  const [postLiked, setPostLiked] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const fetchComments = async () => {
      await request<IComment[]>({
        endpoint: `/api/v1/feed/posts/${post.id}/comments`,
        onSuccess: (data) => setComments(data),
        onFailure: (error) => {
          console.error(error);
        },
      });
    };
    fetchComments();
  }, [post.id]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(`/topic/likes/${post.id}`, (message) => {
      const likes = JSON.parse(message.body);
      setLikes(likes);
      setPostLiked(likes.some((like: IUser) => like.id === user?.id));
    });
    return () => subscription?.unsubscribe();
  }, [post.id, user?.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(`/topic/comments/${post.id}`, (message) => {
      const comment = JSON.parse(message.body);
      setComments((prev) => {
        const index = prev.findIndex((c) => c.id === comment.id);
        if (index === -1) {
          return [comment, ...prev];
        }
        return prev.map((c) => (c.id === comment.id ? comment : c));
      });
    });

    return () => subscription?.unsubscribe();
  }, [post.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(
      `/topic/comments/${post.id}/delete`,
      (message) => {
        const comment = JSON.parse(message.body);
        setComments((prev) => {
          return prev.filter((c) => c.id !== comment.id);
        });
      }
    );

    return () => subscription?.unsubscribe();
  }, [post.id, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(`/topic/posts/${post.id}/delete`, () => {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    });
    return () => subscription?.unsubscribe();
  }, [post.id, setPosts, webSocketClient]);

  useEffect(() => {
    const subscription = webSocketClient?.subscribe(`/topic/posts/${post.id}/edit`, (data) => {
      const post = JSON.parse(data.body);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    });
    return () => subscription?.unsubscribe();
  }, [post.id, setPosts, webSocketClient]);

  useEffect(() => {
    const fetchLikes = async () => {
      await request<IUser[]>({
        endpoint: `/api/v1/feed/posts/${post.id}/likes`,
        onSuccess: (data) => {
          setLikes(data);
          setPostLiked(data.some((like) => like.id === user?.id));
        },
        onFailure: (error) => {
          console.error(error);
        },
      });
    };
    fetchLikes();
  }, [post.id, user?.id]);

  const like = async () => {
    await request<IPost>({
      endpoint: `/api/v1/feed/posts/${post.id}/like`,
      method: "PUT",
      onSuccess: () => {},
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const postComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content) {
      return;
    }
    await request<IPost>({
      endpoint: `/api/v1/feed/posts/${post.id}/comments`,
      method: "POST",
      body: JSON.stringify({ content }),
      onSuccess: () => setContent(""),
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const deleteComment = async (id: number) => {
    await request<void>({
      endpoint: `/api/v1/feed/comments/${id}`,
      method: "DELETE",
      onSuccess: () => {
        setComments((prev) => prev.filter((c) => c.id !== id));
      },
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const editComment = async (id: number, content: string) => {
    await request<IComment>({
      endpoint: `/api/v1/feed/comments/${id}`,
      method: "PUT",
      body: JSON.stringify({ content }),
      onSuccess: (data) => {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return data;
            }
            return c;
          })
        );
      },
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const deletePost = async (id: number) => {
    await request<void>({
      endpoint: `/api/v1/feed/posts/${id}`,
      method: "DELETE",
      onSuccess: () => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      },
      onFailure: (error) => {
        console.error(error);
      },
    });
  };

  const editPost = async (data: FormData) => {
    await request<IPost>({
      endpoint: `/api/v1/feed/posts/${post.id}`,
      method: "PUT",
      body: data,
      contentType: "multipart/form-data",
      onSuccess: (data) => {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === post.id) {
              return data;
            }
            return p;
          })
        );
        setShowMenu(false);
      },
      onFailure: (error) => {
        throw new Error(error);
      },
    });
  };

  return (
    <>
      {editing ? (
        <Madal
          title="Editing your post"
          content={post.content}
          picture={post.picture}
          onSubmit={editPost}
          showModal={editing}
          setShowModal={setEditing}
        />
      ) : null}
      <div className={classes.root}>
        <div className={classes.top}>
          <div className={classes.author}>
            <button
              onClick={() => {
                navigate(`/profile/${post.author.id}`);
              }}
            >
              <img
                className={classes.avatar}
                src={
                  post.author.profilePicture
                    ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${post.author.profilePicture}`
                    : "/avatar.svg"
                }
                alt=""
              />
            </button>
            <div>
              <div className={classes.name}>
                {post.author.firstName + " " + post.author.lastName}
              </div>
              <div className={classes.title}>
                {post.author.position + " at " + post.author.company}
              </div>
              <TimeAgo
                date={post.creationDate}
                edited={!!post.updatedDate}
                className={classes.date}
              />
            </div>
          </div>
          <div>
            {post.author.id == user?.id && (
              <button
                className={`${classes.toggle} ${showMenu ? classes.active : ""}`}
                onClick={() => setShowMenu(!showMenu)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
                  <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
                </svg>
              </button>
            )}
            {showMenu && (
              <div className={classes.menu}>
                <button onClick={() => setEditing(true)}>Edit</button>
                <button onClick={() => deletePost(post.id)}>Delete</button>
              </div>
            )}
          </div>
        </div>
        <div className={classes.content}>{post.content}</div>
        {post.picture && (
          <img
            src={`${import.meta.env.VITE_API_URL}/api/v1/storage/${post.picture}`}
            alt=""
            className={classes.picture}
          />
        )}
        <div className={classes.stats}>
          {likes.length > 0 ? (
            <div className={classes.stat}>
              <span>{postLiked ? "You " : likes[0].firstName + " " + likes[0].lastName + " "}</span>
              {likes.length - 1 > 0 ? (
                <span>
                  and {likes.length - 1} {likes.length - 1 === 1 ? "other" : "others"}
                </span>
              ) : null}{" "}
              liked this
            </div>
          ) : (
            <div></div>
          )}

          {comments.length > 0 ? (
            <button className={classes.stat} onClick={() => setShowComments((prev) => !prev)}>
              <span>{comments.length} comments</span>
            </button>
          ) : (
            <div></div>
          )}
        </div>
        <div className={classes.actions}>
          <button
            disabled={postLiked == undefined}
            onClick={like}
            className={postLiked ? classes.active : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" />
            </svg>
            <span>{postLiked == undefined ? "Loading" : postLiked ? "Liked" : "Like"}</span>
          </button>
          <button
            onClick={() => {
              setShowComments((prev) => !prev);
            }}
            className={showComments ? classes.active : ""}
          >
            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9l.3-.5z" />
            </svg>
            <span>Comment</span>
          </button>
        </div>

        {showComments ? (
          <div className={classes.comments}>
            <form onSubmit={postComment}>
              <Input
                onChange={(e) => setContent(e.target.value)}
                value={content}
                placeholder="Add a comment..."
                name="content"
                style={{ marginBlock: 0 }}
              />
            </form>

            {comments.map((comment) => (
              <Comment
                editComment={editComment}
                deleteComment={deleteComment}
                key={comment.id}
                comment={comment}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
