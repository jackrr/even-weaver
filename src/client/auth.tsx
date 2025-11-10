import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";

export const AuthContext = createContext({
  loading: true,
  loggedIn: false,
  reverify: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const reverify = useCallback(() => {
    async function isLoggedIn() {
      try {
        const res = await fetch("/logged-in");
        if (res.status === 200) {
          setLoggedIn(true);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    isLoggedIn();
  }, [setLoggedIn, setLoading]);

  useEffect(() => {
    reverify();
  }, [reverify]);

  return (
    <AuthContext value={{ loggedIn, loading, reverify }}>
      {children}
    </AuthContext>
  );
}

export function useReverifyAuth() {
  const { reverify } = useContext(AuthContext);
  return reverify;
}

export function useAuthWall() {
  const { loggedIn, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!loggedIn) {
      navigate("/login");
    }
  }, [loggedIn, loading, navigate]);
}

export function useUnauthedWall() {
  const { loggedIn, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn, loading, navigate]);
}
