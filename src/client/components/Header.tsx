import { useAuthContext } from "../auth";

export default function Header() {
  const { loading, loggedIn } = useAuthContext();

  return (
    <div className="flex flex-row pb-2">
      <h1 className="grow">
        <a href="/">Even Weaver</a>
      </h1>
      {!loading && loggedIn ? <a href="/logout">Log Out</a> : null}
      {!loading && !loggedIn ? (
        <div className="flex flex-row gap-4">
          <a href="/login">Log In</a>
          <span>|</span>
          <a href="/register">Register</a>
        </div>
      ) : null}
    </div>
  );
}
