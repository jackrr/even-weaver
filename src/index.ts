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

export const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
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

  development: process.env.NODE_ENV === "development" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
