import { useRef, type KeyboardEvent } from "react";
import { useReverifyAuth } from "../auth";

export default function AuthForm({ kind }: { kind: "login" | "register" }) {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const reverifyAuth = useReverifyAuth();

  function submitForm() {
    async function submit() {
      await fetch(kind === "login" ? "/login" : "/accounts", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameRef.current?.value,
          password: passwordRef.current?.value,
        }),
      });

      reverifyAuth();
    }

    submit();
  }

  function submitOnEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Return" || e.key === "Enter") {
      submitForm();
    }
  }

  return (
    <div className="my-10 flex flex-col gap-4">
      <input
        className="border rounded-lg p-2"
        ref={usernameRef}
        type="text"
        onKeyDown={submitOnEnter}
      />
      <input
        className="border rounded-lg p-2"
        ref={passwordRef}
        type="password"
        onKeyDown={submitOnEnter}
      />
      <button
        className="border p-2 bg-blue-900 cursor-pointer"
        onClick={() => submitForm()}
      >
        Submit
      </button>
    </div>
  );
}
