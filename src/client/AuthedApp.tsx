import { Outlet } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthWall } from "./auth";
import { fetchColors } from "./lib/api";

export default function AuthedApp() {
  useAuthWall();
  // pre-seed cache with colors
  useQuery({
    queryKey: ["colors"],
    queryFn: fetchColors,
    staleTime: "static",
  });

  console.log("In authed app!");

  return <Outlet />;
}
