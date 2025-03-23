import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/Button/Button";
import { Input } from "../../../../components/Input/Input";
import { request } from "../../../../utils/api";
import { Box } from "../../components/Box/Box";
import { IUser, useAuthentication } from "../../contexts/AuthenticationContextProvider";
import classes from "./Profile.module.scss";
export function Profile() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user, setUser } = useAuthentication();
  const [error, setError] = useState("");
  const [data, setData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: user?.company || "",
    position: user?.position || "",
    location: user?.location || "",
  });
  const onSubmit = async () => {
    if (!data.firstName || !data.lastName) {
      setError("Please fill in your first and last name.");
      return;
    }
    if (!data.company || !data.position) {
      setError("Please fill in your latest company and position.");
      return;
    }
    if (!data.location) {
      setError("Please fill in your location.");
      return;
    }
    await request<IUser>({
      endpoint: `/api/v1/authentication/profile/${user?.id}/info?firstName=${data.firstName}&lastName=${data.lastName}&company=${data.company}&position=${data.position}&location=${data.location}`,
      method: "PUT",
      body: JSON.stringify(data),
      onSuccess: (data) => {
        setUser(data);
        navigate("/");
      },
      onFailure: (error) => setError(error),
    });
  };
  return (
    <div className={classes.root}>
      <Box>
        <h1>Only one last step</h1>
        <p>Tell us a bit about yourself so we can personalize your experience.</p>
        {step === 0 && (
          <div className={classes.inputs}>
            <Input
              onFocus={() => setError("")}
              required
              label="First Name"
              name="firstName"
              placeholder="Jhon"
              onChange={(e) => setData((prev) => ({ ...prev, firstName: e.target.value }))}
              value={data.firstName}
            ></Input>
            <Input
              onFocus={() => setError("")}
              required
              label="Last Name"
              name="lastName"
              placeholder="Doe"
              onChange={(e) => setData((prev) => ({ ...prev, lastName: e.target.value }))}
              value={data.lastName}
            ></Input>
          </div>
        )}
        {step === 1 && (
          <div className={classes.inputs}>
            <Input
              onFocus={() => setError("")}
              label="Latest company"
              name="company"
              placeholder="Docker Inc"
              onChange={(e) => setData((prev) => ({ ...prev, company: e.target.value }))}
              value={data.company}
            ></Input>
            <Input
              onFocus={() => setError("")}
              onChange={(e) => setData((prev) => ({ ...prev, position: e.target.value }))}
              value={data.position}
              label="Latest position"
              name="position"
              placeholder="Software Engineer"
            ></Input>
          </div>
        )}
        {step == 2 && (
          <Input
            onFocus={() => setError("")}
            label="Location"
            name="location"
            placeholder="San Francisco, CA"
            value={data.location}
            onChange={(e) => setData((prev) => ({ ...prev, location: e.target.value }))}
          ></Input>
        )}
        {error && <p className={classes.error}>{error}</p>}
        <div className={classes.buttons}>
          {step > 0 && (
            <Button outline onClick={() => setStep((prev) => prev - 1)}>
              Back
            </Button>
          )}
          {step < 2 && (
            <Button
              disabled={
                (step === 0 && (!data.firstName || !data.lastName)) ||
                (step === 1 && (!data.company || !data.position))
              }
              onClick={() => setStep((prev) => prev + 1)}
            >
              Next
            </Button>
          )}
          {step === 2 && (
            <Button disabled={!data.location} onClick={onSubmit}>
              Submit
            </Button>
          )}
        </div>
      </Box>
    </div>
  );
}
