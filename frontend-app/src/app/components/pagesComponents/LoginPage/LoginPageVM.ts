import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";

export type AuthMode = "login" | "register";

export const useLoginPageVM = () => {
  const router = useRouter();
  const auth = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const isRegister = mode === "register";

  const switchToLogin = () => {
    setMode("login");
    setError(null);
  };

  const switchToRegister = () => {
    setMode("register");
    setError(null);
  };

  const submit = async () => {
    setError(null);

    if (!login || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        await auth.login({ login, password });
      } else {
        await auth.register({
          login,
          password,
          repeatPassword: confirmPassword,
        });
      }

      router.replace("/dashboard");
    } catch {
      setError(isLogin ? "Invalid login or password." : "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    isLogin,
    isRegister,

    login,
    password,
    confirmPassword,

    setLogin,
    setPassword,
    setConfirmPassword,

    switchToLogin,
    switchToRegister,

    submit,
    loading,
    error,
  };
};
