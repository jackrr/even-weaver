import DB from "../../models/index";
const { AuthToken, User } = DB;

const SESSION_KEY = "session";

export async function authenticate<T extends string>(req: Bun.BunRequest<T>) {
  const token = req.cookies.get(SESSION_KEY);
  if (!token) return Promise.reject("No valid session token");

  const user = await User.findOne({ where: { "auth_token.token": token } });
  if (!user) return Promise.reject("Invalid session token");
  return user;
}

export async function login(req: Bun.BunRequest<"/login">) {
  const payload = await req.json();
  const user = await User.findOne({ where: { username: payload.username } });
  if (!user) {
    return new Response("Failed.", { status: 400 });
  }

  if (!(await user.verifyPassword(payload.password))) {
    return new Response("Failed.", { status: 400 });
  }

  const token = await AuthToken.generate(user);

  req.cookies.set(SESSION_KEY, token.token);
  return Response.redirect("/");
}

export async function createUser(req: Bun.BunRequest<"/accounts">) {
  const payload = await req.json();
  const user = await User.createWithPassword(
    payload.username,
    payload.passowrd,
  );
  const token = await AuthToken.generate(user);

  req.cookies.set(SESSION_KEY, token.token);
  return Response.redirect("/");
}

export async function isLoggedIn(req: Bun.BunRequest<"/logged-in">) {
  try {
    await authenticate(req);
  } catch (e) {
    return Response.json(e, { status: 401 });
  }
  return Response.json({ status: "ok" });
}
