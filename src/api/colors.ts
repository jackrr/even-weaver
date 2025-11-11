import { errorResponse } from "@/util/error";
import { authenticate } from "@/api/auth";
import DB from "../models/index";
const { Color } = DB;

export async function getColors(req: Bun.BunRequest<"/colors">) {
  try {
    await authenticate(req);
    const colors = await Color.findAll();
    return Response.json(colors);
  } catch (e) {
    return errorResponse(e);
  }
}
