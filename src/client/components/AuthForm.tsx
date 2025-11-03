import { useRef } from "react";

export default function AuthForm({ kind }: { kind: "login" | "register" }) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function submitForm() {
    async function submit() {
      const res = await fetch(kind === "login" ? "/login" : "/accounts", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameRef.current?.value,
          password: passwordRef.current?.value,
        }),
      });
    }

    submit();
  }

  return (
    <>
      <input ref={usernameRef} type="text" />
      <input ref={passwordRef} type="password" />
      <button onClick={() => submitForm()}>Submit</button>
    </>
  );
}
