import "./index.css";
import { AuthProvider } from "./auth";
import Routes from "./Routes";

export function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
