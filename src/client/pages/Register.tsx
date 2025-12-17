import { Link } from "react-router";
import AuthForm from "@/client/components/AuthForm";
import { useUnauthedWall } from "@/client/auth";
import { usePageTitle } from "@/client/lib/title";

export default function Login() {
  useUnauthedWall();
  usePageTitle("Sign up");

  return (
    <>
      <AuthForm kind="register" />
      <p>
        Already have an account? <Link to="/login">Log in here.</Link>
      </p>
    </>
  );
}
