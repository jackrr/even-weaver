import { errorResponse, ErrorCode } from "@/util/error";
import DB from "@/models/index";
import { parseWeavePayload } from "@/models/weave";
import { authenticate } from "./auth";

const { Weave } = DB;
async function loadUserWeave(req: Bun.BunRequest<"/weaves/:id">) {
  const user = await authenticate(req);
  const weaveId = req.params.id;

  const weave = await Weave.findByPk(weaveId);
  if (!weave)
    return Promise.reject({
      status: ErrorCode.NotFound,
      message: "Weave not found",
    });

  if (weave.userId !== user.id)
    return Promise.reject({
      status: ErrorCode.Forbidden,
      message: "You do not have permission to view this",
    });

  return weave;
}

export async function getWeave(req: Bun.BunRequest<"/weaves/:id">) {
  try {
    const weave = await loadUserWeave(req);
    return Response.json(weave.serialize());
  } catch (e) {
    return errorResponse(e);
  }
}

export async function updateWeave(req: Bun.BunRequest<"/weaves/:id">) {
  try {
    const weave = await loadUserWeave(req);
    const json = await req.json();
    const payload = await parseWeavePayload(json);
    weave.name = payload.name;
    weave.pattern = Buffer.from(payload.pattern);
    await weave.save();
    return Response.json(weave.serialize());
  } catch (e) {
    return errorResponse(e);
  }
}

export async function deleteWeave(req: Bun.BunRequest<"/weaves/:id">) {
  try {
    const weave = await loadUserWeave(req);
    await weave.destroy();
    return Response.json("Deleted weave.", { status: 200 });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function getUserWeaves(req: Bun.BunRequest<"/weaves">) {
  try {
    const user = await authenticate(req);
    const weaves = await Weave.findAll({ where: { userId: user.id } });
    return Response.json(weaves.map((w) => w.serialize()));
  } catch (e) {
    return errorResponse(e);
  }
}

export async function createWeave(req: Bun.BunRequest<"/weaves">) {
  try {
    const user = await authenticate(req);
    const json = await req.json();
    const payload = await parseWeavePayload(json);
    const weave = await Weave.create({
      ...payload,
      userId: user.id,
    });
    return Response.json(weave.serialize(), { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
