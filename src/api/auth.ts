import { errorResponse, ErrorCode } from "@/util/error";
import DB from "../models/index";
import { Op } from "sequelize";
const { AuthToken, User } = DB;

const SESSION_KEY = "session";

export async function authenticate<T extends string>(req: Bun.BunRequest<T>) {
  const token = req.cookies.get(SESSION_KEY);
  if (!token)
    return Promise.reject({
      status: ErrorCode.Unauthenticated,
      message: "No session token.",
    });

  const user = await User.findOne({
    include: [
      {
        model: AuthToken,
        as: "authTokens",
        where: {
          token,
          expiresAt: {
            [Op.or]: [null, { [Op.gt]: new Date() }],
          },
        },
      },
    ],
  });
  if (!user)
    return Promise.reject({
      status: ErrorCode.Unauthenticated,
      message: "Session token invalid.",
    });
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

  req.cookies.set(SESSION_KEY, token.token, { expires: token.expiresAt });
  return Response.redirect("/");
}

export function logout(req: Bun.BunRequest<"/logout">) {
  req.cookies.delete(SESSION_KEY);
  return Response.redirect("/login");
}

export async function createUser(req: Bun.BunRequest<"/accounts">) {
  const payload = await req.json();
  const user = await User.createWithPassword(
    payload.username,
    payload.password,
  );
  const token = await AuthToken.generate(user);

  req.cookies.set(SESSION_KEY, token.token, { expires: token.expiresAt });
  return Response.redirect("/");
}

export async function isLoggedIn(req: Bun.BunRequest<"/logged-in">) {
  try {
    await authenticate(req);
    return Response.json({ status: "ok" });
  } catch (e) {
    return errorResponse(e);
  }
}
