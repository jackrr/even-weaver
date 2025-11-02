import { useUnauthedWall } from "./auth";

export default function Register() {
  useUnauthedWall();

  return <h1>Register</h1>;
}
