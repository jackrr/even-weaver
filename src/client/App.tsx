import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usePreventDefaultTapInteractions } from "@/client/lib/prevent-default-tap-interactions";
import "./index.css";
import { AuthProvider } from "./auth";
import Routes from "./Routes";
import Header from "./components/Header";

export function App() {
  const [client] = useState(() => new QueryClient());
  usePreventDefaultTapInteractions();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("eruda").then((eruda) => eruda.default.init());
    }
  }, []);

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <div className="flex flex-col h-full w-full p-safe overflow-hidden max-w-5xl p-4">
          <Header />
          <Routes />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
