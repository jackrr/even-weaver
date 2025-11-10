import { beforeEach, expect, test, describe } from "bun:test";
import { addSeconds, subSeconds } from "date-fns";
import DB from "../models/index";

const { AuthToken, User } = DB;

describe("/logged-in", () => {
  test("401 missing a session token", async () => {
    const res = await fetch("localhost:3000/logged-in");
    expect(res.status).toBe(401);
  });

  test("401 with invalid session token", async () => {
    const res = await fetch("localhost:3000/logged-in", {
      headers: {
        Cookie: "session=abc",
      },
    });

    expect(res.status).toBe(401);
  });

  test("401 with expired session token", async () => {
    const user = await User.createWithPassword("username", "password!23");
    const token = await AuthToken.create({
      userId: user.id,
      token: "a-token",
      expiresAt: subSeconds(new Date(), 1),
    });

    const res = await fetch("localhost:3000/logged-in", {
      headers: {
        Cookie: `session=${token.token}`,
      },
    });

    expect(res.status).toBe(401);
  });

  test("200 with valid session token", async () => {
    const user = await User.createWithPassword("username", "password!23");
    const token = await AuthToken.create({
      userId: user.id,
      token: "a-token",
      expiresAt: addSeconds(new Date(), 100),
    });

    const res = await fetch("localhost:3000/logged-in", {
      headers: {
        Cookie: `session=${token.token}`,
      },
    });

    expect(res.status).toBe(200);
  });
});

describe("/login", () => {
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

  test("200 with valid creds", async () => {
    const res = await login(username, password);
    expect(res.status).toBe(302);
    expect(res.headers.getSetCookie().length).toBe(1);
    expect(res.headers.getSetCookie()[0]).toMatch(/^session.*/);
  });

  test("400 with bad username", async () => {
    const res = await login("nottheuser", password);
    expect(res.status).toBe(400);
  });

  test("400 with bad password", async () => {
    const res = await login(username, "notthepassword357!");
    expect(res.status).toBe(400);
  });
});
