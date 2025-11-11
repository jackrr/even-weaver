import { beforeEach, expect, test, describe } from "bun:test";
import type Weave from "../models/weave";
import type User from "../models/user";
import DB from "../models/index";
import { fetchAsUser } from "../test-helpers";

describe("GET /api/weaves", () => {
  const { Weave, User } = DB;
  const url = "localhost:3000/api/weaves";

  let authedFetch: Awaited<ReturnType<typeof fetchAsUser>>;
  let user: User;

  beforeEach(async () => {
    user = await User.createWithPassword("a user", "abc123!!");
    authedFetch = await fetchAsUser(user);
  });

  test("returns 401 for invalid session", async () => {
    const res = await fetch(url);
    expect(res.status).toBe(401);
  });

  test("returns 0 weaves when user has none", async () => {
    const res = await authedFetch(url);
    expect(res.status).toBe(200);
    const result = await res.json();
    expect(result).toBeArrayOfSize(0);
  });

  describe("with weaves", () => {
    let currentUserWeaves: Weave[] = [];

    beforeEach(async () => {
      currentUserWeaves = [];
      const otherUser = await User.createWithPassword(
        "a different user",
        "abc123!!",
      );

      currentUserWeaves.push(
        await Weave.create({
          name: "weave 1",
          userId: user.id,
          pattern: Buffer.from("{}", "utf8"),
        }),
      );

      currentUserWeaves.push(
        await Weave.create({
          name: "weave 2",
          userId: user.id,
          pattern: Buffer.from("{}", "utf8"),
        }),
      );

      // Other user weave
      await Weave.create({
        name: "weave 3",
        userId: otherUser.id,
        pattern: Buffer.from("{}", "utf8"),
      });
    });

    test("returns only current user's weaves", async () => {
      const res = await authedFetch(url);
      expect(res.status).toBe(200);
      const results = await res.json();
      expect(results).toBeArrayOfSize(currentUserWeaves.length);
      const expectedIds = currentUserWeaves.map((w) => w.id);
      for (const weave of results) {
        expect(weave.id).toBeOneOf(expectedIds);
      }
    });
  });
});

describe("POST /api/weaves", () => {
  const { Weave, User } = DB;
  const url = "localhost:3000/api/weaves";

  let authedFetch: Awaited<ReturnType<typeof fetchAsUser>>;
  let user: User;

  beforeEach(async () => {
    user = await User.createWithPassword("a user", "abc123!!");
    authedFetch = await fetchAsUser(user);
  });

  test("creates the weave", async () => {
    const newName = "new name";
    const newPattern = '{ 0: { 0: { c: 0, s: "todo"}} }';
    const res = await authedFetch(url, {
      method: "post",
      body: JSON.stringify({
        name: newName,
        pattern: newPattern,
      }),
    });

    expect(res.status).toBe(201);
    const weaveFromApi = await res.json();
    const weave = await Weave.findByPk(weaveFromApi.id);
    expect(weave).not.toBeNull();
    expect(weaveFromApi.name).toBe(newName);
    expect(weaveFromApi.pattern).toBe(newPattern);
  });
});

describe("/api/weaves/:id", () => {
  const { Weave, User } = DB;
  const url = "localhost:3000/api/weaves";

  let authedFetch: Awaited<ReturnType<typeof fetchAsUser>>;
  let user: User;
  let weave: Weave;

  beforeEach(async () => {
    user = await User.createWithPassword("a user", "abc123!!");
    authedFetch = await fetchAsUser(user);
    weave = await Weave.create({
      name: "weave",
      userId: user.id,
      pattern: Buffer.from("{}", "utf8"),
    });

    await Weave.create({
      name: "some other weave",
      userId: user.id,
      pattern: Buffer.from("{}", "utf8"),
    });
  });

  test("GET returns the specific weave", async () => {
    const res = await authedFetch(`${url}/${weave.id}`);
    expect(res.status).toBe(200);
    const weaveFromApi = await res.json();
    expect(weaveFromApi.name).toBe(weave.name);
    expect(weaveFromApi.pattern).toBe(weave.pattern.toString());
  });

  test("PUT updates the specific weave", async () => {
    const newName = "new name";
    const newPattern = '{ 0: { 0: { c: 0, s: "todo"}} }';
    const res = await authedFetch(`${url}/${weave.id}`, {
      method: "put",
      body: JSON.stringify({
        name: newName,
        pattern: newPattern,
      }),
    });

    expect(res.status).toBe(200);
    await weave.reload();
    expect(weave.name).toBe(newName);
    expect(weave.pattern.toString()).toBe(newPattern);
  });

  test("DELETE deletes the specific weave", async () => {
    const res = await authedFetch(`${url}/${weave.id}`, { method: "delete" });
    expect(res.status).toBe(200);
    const check = await Weave.findByPk(weave.id);
    expect(check).toBeNull();
  });
});
