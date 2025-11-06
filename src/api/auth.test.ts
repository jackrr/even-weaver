import { beforeEach, expect, test, describe } from "bun:test";
const { AuthToken, User } = DB;
import DB from "../models/index";

test("/logged-in gives 404 missing a session token", async () => {
  const res = await fetch("localhost:3000/logged-in");
  expect(res.status).toBe(401);
});

test("/logged-in gives 404 with invalid session token", async () => {
  const res = await fetch("localhost:3000/logged-in", {
    headers: {
      Cookie: "session=abc",
    },
  });

  expect(res.status).toBe(401);
});

test("/logged-in gives 200 with valid session token", async () => {
  const user = await User.createWithPassword("username", "password!23");
  const token = await AuthToken.generate(user);

  const res = await fetch("localhost:3000/logged-in", {
    headers: {
      Cookie: `session=${token.token}`,
    },
  });

  expect(res.status).toBe(200);
});

describe("login", () => {
  const username = "username";
  const password = "password!23";

  beforeEach(async () => {
    await User.createWithPassword(username, password);
  });

  function login(username: string, password: string) {
    return fetch("localhost:3000/login", {
      method: "post",
      redirect: "manual",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }

  test("/login gives 200 with valid creds", async () => {
    const res = await login(username, password);
    expect(res.status).toBe(302);
    expect(res.headers.getSetCookie().length).toBe(1);
    expect(res.headers.getSetCookie()[0]).toMatch(/^session.*/);
  });

  test("/login gives 400 with bad username", async () => {
    const res = await login("nottheuser", password);
    expect(res.status).toBe(400);
  });

  test("/login gives 400 with bad password", async () => {
    const res = await login(username, "notthepassword357!");
    expect(res.status).toBe(400);
  });
});
