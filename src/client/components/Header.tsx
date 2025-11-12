import { useAuthContext } from "../auth";

export default function Header() {
  const { loading, loggedIn } = useAuthContext();

  return (
    <div className="flex flex-row fixed top-100">
      <h1 className="grow">Even Weaver</h1>
      {!loading && loggedIn ? <a href="/logout">Log Out</a> : null}
      {!loading && !loggedIn ? (
        <div className="grid gap-4">
          <a href="/login">Log In</a>
          <span>|</span>
          <a href="/register">Register</a>
        </div>
      ) : null}
    </div>
  );
}
