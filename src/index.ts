import { serve } from "bun";
import index from "./index.html";
import { login, logout, createUser, isLoggedIn } from "./api/auth";
import { tracedHandler } from "@/api/util";
import { getColors } from "./api/colors";
import {
  getWeave,
  updateWeave,
  deleteWeave,
  getUserWeaves,
  createWeave,
} from "./api/weaves";

export const server = serve({
  routes: {
    "/*": index,

    "/logged-in": {
      GET: tracedHandler(isLoggedIn),
    },

    "/login": {
      POST: tracedHandler(login),
    },

    "/logout": {
      GET: tracedHandler(logout),
    },

    "/accounts": {
      POST: tracedHandler(createUser),
    },

    "/api/weaves/:id": {
      GET: tracedHandler(getWeave),
      PUT: tracedHandler(updateWeave),
      DELETE: tracedHandler(deleteWeave),
    },
    "/api/weaves": {
      GET: tracedHandler(getUserWeaves),
      POST: tracedHandler(createWeave),
    },

    "/api/colors": {
      GET: tracedHandler(getColors),
    },
  },

  development: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
});

console.log(`🚀 Server running at ${server.url}`);
