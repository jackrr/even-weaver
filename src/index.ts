import { serve } from "bun";
import index from "./index.html";
import { login, logout, createUser, isLoggedIn } from "./api/auth";
import { getColors } from "./api/colors";
import {
  getWeave,
  updateWeave,
  deleteWeave,
  getUserWeaves,
  createWeave,
} from "./api/weaves";

// FIXME! Dockerfile doesn't serve in prod

export const server = serve({
  routes: {
    "/*": index,

    "/logged-in": {
      GET: isLoggedIn,
    },

    "/login": {
      POST: login,
    },

    "/logout": {
      GET: logout,
    },

    "/accounts": {
      POST: createUser,
    },

    "/api/weaves/:id": {
      GET: getWeave,
      PUT: updateWeave,
      DELETE: deleteWeave,
    },
    "/api/weaves": {
      GET: getUserWeaves,
      POST: createWeave,
    },

    "/api/colors": {
      GET: getColors,
    },
  },

  development: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
});

console.log(`🚀 Server running at ${server.url}`);
