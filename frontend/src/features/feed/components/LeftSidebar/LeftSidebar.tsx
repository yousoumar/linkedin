import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import classes from "./LeftSidebar.module.scss";
export function LeftSidebar() {
  const { user } = useAuthentication();
  return (
    <div className={classes.root}>
      <div className={classes.cover}>
        <img
          src="https://images.unsplash.com/photo-1727163941315-1cc29bb49e54?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Cover"
        />
      </div>
      <div className={classes.avatar}>
        <img src={user?.profilePicture || "/avatar.png"} alt="" />
      </div>
      <div className={classes.name}>{user?.firstName + " " + user?.lastName}</div>
      <div className={classes.title}>{user?.position + " at " + user?.company}</div>
      <div className={classes.info}>
        <div className={classes.item}>
          <div className={classes.label}>Profile viewers</div>
          <div className={classes.value}>1,234</div>
        </div>
        <div className={classes.item}>
          <div className={classes.label}>Connexions</div>
          <div className={classes.value}>4,567</div>
        </div>
      </div>
    </div>
  );
}
