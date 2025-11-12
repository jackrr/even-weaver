import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "./index.css";
import { AuthProvider } from "./auth";
import Routes from "./Routes";
import Header from "./components/Header";

export function App() {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <div className="h-screen w-screen overflow-hidden relative">
          <Header />
          <Routes />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
