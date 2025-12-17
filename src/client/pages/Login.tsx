import { Link } from "react-router";
import AuthForm from "@/client/components/AuthForm";
import { useUnauthedWall } from "@/client/auth";
import { usePageTitle } from "@/client/lib/title";

export default function Login() {
  useUnauthedWall();
  usePageTitle("Login");

  return (
    <>
      <AuthForm kind="login" />
      <p>
        Don't have an account? <Link to="/register">Create one here.</Link>
      </p>
    </>
  );
}
