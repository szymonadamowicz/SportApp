import { useState } from "react"

export type AuthMode = "login" | "register"

export const useLoginPageVM = () => {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const isLogin = mode === "login"
  const isRegister = mode === "register"

  const switchToLogin = () => setMode("login")
  const switchToRegister = () => setMode("register")

  const submit = () => {
    return
  }

  return {
    mode,
    isLogin,
    isRegister,
    email,
    password,
    confirmPassword,
    setEmail,
    setPassword,
    setConfirmPassword,
    switchToLogin,
    switchToRegister,
    submit,
  }
}
