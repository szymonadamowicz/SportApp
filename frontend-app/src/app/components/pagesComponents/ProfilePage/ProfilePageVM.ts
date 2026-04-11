"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { loginApi } from "@/api/login.api";
import {
  changePasswordApi,
  getProfileApi,
  updateProfileApi,
} from "@/api/profile.api";
import { PasswordState, SaveState, VerifyState } from "@/types/profile/profile";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useProfilePageVM = () => {
  const auth = useAuth();
  const login = auth.session?.user?.login ?? "";

  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

  const [passwordState, setPasswordState] = useState<PasswordState>("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const canVerify = useMemo(() => {
    return login.length > 0 && verifyPassword.length > 0;
  }, [login, verifyPassword]);

  const updateVerifyPassword = (value: string) => {
    setVerifyPassword(value);

    if (verifyState === "verified") {
      setVerifyState("idle");
    }
  };

  const canSaveProfile = useMemo(() => {
    if (!login) return false;
    if (email && !emailRegex.test(email)) return false;
    return true;
  }, [login, email]);

  const emailError = useMemo(() => {
    if (!email) return undefined;
    if (!emailRegex.test(email)) {
      return "Enter a valid email address, for example name@example.com.";
    }

    return undefined;
  }, [email]);

  const canChangePassword = useMemo(() => {
    if (verifyState !== "verified") return false;
    if (!verifyPassword || !newPassword || !repeatNewPassword) return false;
    if (newPassword !== repeatNewPassword) return false;
    return true;
  }, [verifyState, verifyPassword, newPassword, repeatNewPassword]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const p = await getProfileApi();
        if (!mounted) return;

        setName(p.name ?? "");
        setEmail(p.email ?? "");
        setBirthDate(p.birthDate ?? "");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    if (login) load();
    else setIsLoading(false);

    return () => {
      mounted = false;
    };
  }, [login]);

  const verify = async () => {
    if (!canVerify) return;

    setVerifyState("verifying");
    try {
      const token = await loginApi({
        login,
        password: verifyPassword,
      });

      if (!token) {
        setVerifyState("error");
        return;
      }

      setVerifyState("verified");
    } catch {
      setVerifyState("error");
    }
  };

  const saveProfile = async () => {
    if (!canSaveProfile) return;

    setSaveState("saving");
    setSaveError(null);

    try {
      await updateProfileApi({
        name,
        email,
        birthDate,
      });
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 900);
    } catch {
      setSaveState("error");
      setSaveError("Could not save profile.");
    }
  };

  const changePassword = async () => {
    setPasswordError(null);

    if (!canChangePassword) return;

    setPasswordState("saving");

    try {
      await changePasswordApi({
        currentPassword: verifyPassword,
        newPassword,
      });

      setPasswordState("success");
      setNewPassword("");
      setRepeatNewPassword("");
      setTimeout(() => setPasswordState("idle"), 1000);
    } catch {
      setPasswordState("error");
      setPasswordError("Unable to change password. Verify again and retry.");
    }
  };

  return {
    login,

    isLoading,

    name,
    setName,
    email,
    setEmail,
    birthDate,
    setBirthDate,

    saveProfile,
    canSaveProfile,
    emailError,
    saveState,
    saveError,

    verifyPassword,
    setVerifyPassword: updateVerifyPassword,
    verify,
    verifyState,
    canVerify,
    newPassword,
    setNewPassword,
    repeatNewPassword,
    setRepeatNewPassword,

    changePassword,
    canChangePassword,
    passwordState,
    passwordError,

    logout: auth.logout,
  };
};
