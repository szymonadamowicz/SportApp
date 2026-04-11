"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { LoginMode } from "@/types/login/login";

export const useLoginPageVM = () => {
  const auth = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("login");

  const isLogin = mode === "login";
  const isRegister = mode === "register";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = isLogin
    ? login.trim().length > 0 && password.length > 0
    : login.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0;

  const switchToLogin = () => {
    if (isSubmitting) return;
    setError(null);
    setMode("login");
  };

  const switchToRegister = () => {
    if (isSubmitting) return;
    setError(null);
    setMode("register");
  };

  const submit = async () => {
    if (!canSubmit || isSubmitting) return;

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await auth.login({
          login: login.trim(),
          password,
        });

        setSuccessMessage("Login successful. Redirecting...");
        setTimeout(() => router.replace("/dashboard"), 700);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      await auth.register({
        login: login.trim(),
        password,
        repeatPassword: confirmPassword,
      });

      setSuccessMessage("Account created. Redirecting...");
      setTimeout(() => router.replace("/dashboard"), 700);
    } catch (e) {
      if (isLogin) {
        setError("Invalid login or password.");
      } else {
        setError("Account could not be created. Login may already exist." + e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLogin,
    isRegister,
    switchToLogin,
    switchToRegister,

    login,
    setLogin,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,

    submit,
    canSubmit,
    isSubmitting,

    error,
    successMessage,
  };
};
