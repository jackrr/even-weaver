import { Link } from "react-router";
import AuthForm from "@/client/components/AuthForm";
import { useUnauthedWall } from "@/client/auth";

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
