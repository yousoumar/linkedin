import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../../../../components/Loader/Loader";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { request } from "../../../../utils/api";
import {
  IUser,
  useAuthentication,
} from "../../../authentication/contexts/AuthenticationContextProvider";
import { RightSidebar } from "../../../feed/components/RightSidebar/RightSidebar";
import { About } from "../../components/About/About";
import { Activity } from "../../components/Activity/Activity";
import { Header } from "../../components/Header/Header";
import classes from "./Profile.module.scss";
export function Profile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const { user: authUser, setUser:setAuthUser } = useAuthentication();
  const [user, setUser] = useState<IUser | null>(null);

  usePageTitle(user?.firstName + " " + user?.lastName);

  useEffect(() => {
    setLoading(true);
    if (id == authUser?.id) {
      setUser(authUser);
      setLoading(false);
    } else {
      request<IUser>({
        endpoint: `/api/v1/authentication/users/${id}`,
        onSuccess: (data) => {
          setUser(data);
          setLoading(false);
        },
        onFailure: (error) => console.log(error),
      });
    }
  }, [authUser, id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={classes.profile}>
      <section className={classes.main}>
        <Header user={user} authUser={authUser} onUpdate={(user) => setAuthUser(user)} />
        <About user={user} authUser={authUser} onUpdate={(user) => setAuthUser(user)} />
        <Activity authUser={authUser} user={user} id={id} />

        <div className={classes.experience}>
          <h2>Experience</h2>
          <p>TODO</p>
        </div>
        <div className={classes.education}>
          <h2>Education</h2>
          <p>TODO</p>
        </div>
        <div className={classes.skills}>
          <h2>Skills</h2>
          <p>TODO</p>
        </div>
      </section>
      <div className={classes.sidebar}>
        <RightSidebar />
      </div>
    </div>
  );
}
