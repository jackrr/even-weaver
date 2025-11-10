import DB from "./models/index";
import type User from "./models/user";

type FetchOpts = Parameters<typeof fetch>[1];

export async function fetchAsUser(user: User) {
  const token = await DB.AuthToken.generate(user);

  return function authedFetch(path: string, opts?: FetchOpts) {
    return fetch(path, {
      ...opts,
      headers: {
        ...opts?.headers,
        Cookie: `session=${token.token}`,
      },
    });
  };
}
