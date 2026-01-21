"use client";

import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { FitnessInput } from "@/components/FitnessInput";
import { FitnessButton } from "@/components/fitnessButton";
import { useLoginPageVM } from "./LoginPageVM";

export default function LoginPage() {
  const vm = useLoginPageVM();

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 0%, rgba(34,197,94,0.22), transparent 70%), radial-gradient(60% 55% at 15% 25%, rgba(56,189,248,0.12), transparent 65%), radial-gradient(55% 55% at 85% 35%, rgba(250,204,21,0.08), transparent 65%)",
        }}
      />

      <div
        className="w-full max-w-md rounded-2xl p-8 relative fade-in"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,31,36,0.96), rgba(19,23,27,0.94))",
          border: "1px solid rgba(34,197,94,0.22)",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-[var(--accent)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to landing
        </Link>

        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(34,197,94,0.1))",
              border: "1px solid rgba(34,197,94,0.45)",
              boxShadow: "0 12px 36px rgba(34,197,94,0.3)",
            }}
          >
            <Dumbbell className="w-7 h-7 text-[var(--accent)]" />
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div
            className="relative grid grid-cols-2 rounded-xl p-1 w-full max-w-xs overflow-hidden"
            style={{
              background: "rgba(15,18,22,0.95)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg transition-transform duration-300"
              style={{
                transform: vm.isRegister ? "translateX(100%)" : "translateX(0)",
                background: "linear-gradient(135deg, #22c55e, #4ade80)",
                boxShadow: "0 6px 22px rgba(34,197,94,0.4)",
              }}
            />

            <button
              type="button"
              onClick={vm.switchToLogin}
              className={`relative z-10 h-10 text-sm font-semibold transition-colors ${
                vm.isLogin ? "text-black" : "text-muted"
              }`}
            >
              Log in
            </button>

            <button
              type="button"
              onClick={vm.switchToRegister}
              className={`relative z-10 h-10 text-sm font-semibold transition-colors ${
                vm.isRegister ? "text-black" : "text-muted"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            vm.submit();
          }}
        >
          <FitnessInput
            label="Name"
            type="text"
            value={vm.login}
            onChange={(e) => vm.setLogin(e.target.value)}
          />

          <FitnessInput
            label="Password"
            type="password"
            value={vm.password}
            onChange={(e) => vm.setPassword(e.target.value)}
          />

          <div
            className={`transition-all duration-300 overflow-hidden ${
              vm.isRegister ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <FitnessInput
              label="Confirm password"
              type="password"
              value={vm.confirmPassword}
              onChange={(e) => vm.setConfirmPassword(e.target.value)}
            />
          </div>

          <FitnessButton
            type="submit"
            className="w-full h-12 mt-6 text-black font-semibold"
            style={{
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
              boxShadow: "0 12px 40px rgba(34,197,94,0.45)",
            }}
          >
            {vm.isLogin ? "Log in" : "Create account"}
          </FitnessButton>
          {vm.error && <p className="text-sm mt-2 text-red-400">{vm.error}</p>}
        </form>
      </div>
    </div>
  );
}
