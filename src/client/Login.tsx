import { useUnauthedWall } from "./auth";

export default function Login() {
  useUnauthedWall();

  return <h1>Log in</h1>;
}
