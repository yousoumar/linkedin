import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../../../utils/api";
import { LeftSidebar } from "../../components/LeftSidebar/LeftSidebar";
import { Post } from "../../components/Post/Post";
import { RightSidebar } from "../../components/RightSidebar/RightSidebar";
import classes from "./Post.module.scss";
export function PostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const { id } = useParams();

  useEffect(() => {
    request<Post>({
      endpoint: `/api/v1/feed/posts/${id}`,
      onSuccess: setPost,
      onFailure: (error) => console.log(error),
    });
  }, [id]);

  return (
    <div className={classes.root}>
      <div className={classes.left}>
        <LeftSidebar />
      </div>
      <div className={classes.center}>{post && <Post post={post} />}</div>
      <div className={classes.right}>
        <RightSidebar />
      </div>
    </div>
  );
}
