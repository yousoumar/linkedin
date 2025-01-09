import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { LeftSidebar } from "../../components/LeftSidebar/LeftSidebar";
import { IPost, Post } from "../../components/Post/Post";
import { RightSidebar } from "../../components/RightSidebar/RightSidebar";
import classes from "./Post.module.scss";
export function PostPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { id } = useParams();
  const { user } = useAuthentication();

  useEffect(() => {
    request<IPost>({
      endpoint: `/api/v1/feed/posts/${id}`,
      onSuccess: (post) => setPosts([post]),
      onFailure: (error) => console.log(error),
    });
  }, [id]);

  return (
    <div className={classes.root}>
      <div className={classes.left}>
        <LeftSidebar user={user} />
      </div>
      <div className={classes.center}>
        {posts.length > 0 && <Post setPosts={setPosts} post={posts[0]} />}
      </div>
      <div className={classes.right}>
        <RightSidebar />
      </div>
    </div>
  );
}
