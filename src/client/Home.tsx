import { useAuthWall } from "./auth";

export default function Home() {
  useAuthWall();

  return (
    <>
      <h1>Home</h1>
      <a href="/logout">Log Out</a>
    </>
  );
}
