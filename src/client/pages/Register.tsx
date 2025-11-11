import { Link } from "react-router";
import AuthForm from "@/client/components/AuthForm";
import { useUnauthedWall } from "@/client/auth";

export default function Login() {
  useUnauthedWall();

  return (
    <>
      <h1>Create an account</h1>
      <AuthForm kind="register" />
      <p>
        Already have an account? <Link to="/login">Log in here.</Link>
      </p>
    </>
  );
}
