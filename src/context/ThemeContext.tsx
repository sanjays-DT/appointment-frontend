import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../api/axios.ts";
import { useAuth } from "./AuthContext.tsx";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/* ================= APPLY THEME ================= */
const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

/* ================= PROVIDER ================= */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [theme, setTheme] = useState<Theme>("light");

  /* Apply to DOM */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* Login / Logout handler */
  useEffect(() => {
    // Logout → reset
    if (!token || !user) {
      setTheme("light");
      return;
    }

    // Login → fetch preference
    const loadTheme = async () => {
      try {
        const { data } = await api.get("/users/preferences");
        const serverTheme: Theme =
          data?.theme === "dark" ? "dark" : "light";
        setTheme(serverTheme);
      } catch {
        setTheme("light");
      }
    };

    loadTheme();
  }, [token, user?.id]);

  /* Toggle */
  const toggleTheme = async () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    if (!token) return;

    try {
      await api.put("/users/preferences", { theme: nextTheme });
    } catch {
      setTheme(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ================= HOOK ================= */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};
