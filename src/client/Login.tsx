import { Link } from "react-router";
import AuthForm from "./components/AuthForm";
import { useUnauthedWall } from "./auth";

export default function Login() {
  useUnauthedWall();

  return (
    <>
      <h1>Log in</h1>
      <AuthForm kind="login" />
      <p>
        Don't have an account? <Link to="/register">Create one here.</Link>
      </p>
    </>
  );
}
