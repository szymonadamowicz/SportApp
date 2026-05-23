"use client";

import { FitnessInput } from "@/components/FitnessInput";
import { FitnessButton } from "@/components/fitnessButton";
import { useProfilePageVM } from "./ProfilePageVM";
import { Shield, User, KeyRound, LogOut, Check, X } from "lucide-react";

const StatusPill = ({ ok, text }: { ok: boolean; text: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${
        ok ? "rf-status-success" : "rf-status-danger"
      }`}
    >
      {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {text}
    </span>
  );
};

export default function ProfilePage() {
  const vm = useProfilePageVM();

  return (
    <div className="fade-in space-y-5 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Profile
          </h1>
          <p className="text-muted mt-1">
            Manage account details and basic preferences.
          </p>
        </div>

        <FitnessButton
          type="button"
          onClick={() => vm.logout()}
          className="h-11 w-full px-4 sm:w-auto"
          variant="destructive"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </span>
        </FitnessButton>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <section className="rf-surface-panel p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="rf-icon-chip rf-icon-chip--accent">
              <Shield className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Account</h2>
              <p className="text-muted text-sm">
                Basic authentication settings.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <FitnessInput
              label="Login"
              value={vm.login}
              disabled
              className="opacity-80"
            />

            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="text-sm font-medium text-foreground-muted">
                  Verify password
                </p>
                {vm.verifyState === "verified" ? (
                  <StatusPill ok text="Verified" />
                ) : vm.verifyState === "error" ? (
                  <StatusPill ok={false} text="Invalid" />
                ) : (
                  <span className="text-xs text-muted">
                    Required for sensitive actions
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                <FitnessInput
                  label="Current password"
                  type="password"
                  value={vm.verifyPassword}
                  onChange={(e) => vm.setVerifyPassword(e.target.value)}
                />

                <FitnessButton
                  type="button"
                  onClick={vm.verify}
                  disabled={!vm.canVerify || vm.verifyState === "verifying"}
                  className="mt-0 h-12 w-full px-5 md:mt-7 md:w-auto"
                  variant="primary"
                >
                  {vm.verifyState === "verifying" ? "Verifying..." : "Verify"}
                </FitnessButton>
              </div>
            </div>
          </div>
        </section>

        <section className="rf-surface-panel p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="rf-icon-chip rf-icon-chip--info">
              <User className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Profile details</h2>
              <p className="text-muted text-sm">
                Optional information (stored locally in mock mode).
              </p>
            </div>
          </div>

          {vm.isLoading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <div className="space-y-5">
              <FitnessInput
                label="Name"
                value={vm.name}
                onChange={(e) => vm.setName(e.target.value)}
                placeholder="e.g. Szymon"
              />

              <FitnessInput
                label="Email"
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                placeholder="you@example.com"
                error={vm.emailError}
              />

              {vm.emailError && (
                <p className="text-xs text-red-400">
                  Saving is disabled until the email format is valid.
                </p>
              )}

              <FitnessInput
                label="Birth date"
                type="date"
                value={vm.birthDate}
                onChange={(e) => vm.setBirthDate(e.target.value)}
              />

              {vm.saveError && (
                <p className="text-sm text-red-400">{vm.saveError}</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p className="text-xs text-muted">
                  {vm.saveState === "success"
                    ? "Saved."
                    : vm.saveState === "saving"
                      ? "Saving..."
                      : " "}
                </p>

                <FitnessButton
                  type="button"
                  onClick={vm.saveProfile}
                  disabled={!vm.canSaveProfile || vm.saveState === "saving"}
                  className="h-11 w-full px-5 sm:w-auto"
                  variant="secondary"
                >
                  Save changes
                </FitnessButton>
              </div>
            </div>
          )}
        </section>

        <section className="rf-surface-panel p-4 sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-start gap-3 sm:items-center">
            <div className="rf-icon-chip rf-icon-chip--warning">
              <KeyRound className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h2 className="text-lg font-semibold">Change password</h2>
                {vm.verifyState !== "verified" && (
                  <span className="text-xs text-muted">
                    Verify your current password above to enable changes.
                  </span>
                )}
              </div>
              <p className="text-muted text-sm">
                Use the verified password above to confirm the change.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FitnessInput
              label="New password"
              type="password"
              value={vm.newPassword}
              onChange={(e) => vm.setNewPassword(e.target.value)}
              disabled={vm.verifyState !== "verified"}
            />

            <FitnessInput
              label="Confirm new password"
              type="password"
              value={vm.repeatNewPassword}
              onChange={(e) => vm.setRepeatNewPassword(e.target.value)}
              disabled={vm.verifyState !== "verified"}
            />
          </div>

          {vm.passwordError && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400 font-medium">
                {vm.passwordError}
              </p>
            </div>
          )}

          {vm.passwordState === "error" && !vm.passwordError && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400 font-medium">
                Failed to change password. Please try again.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-xs text-muted">
              {vm.passwordState === "success"
                ? "Password updated."
                : vm.passwordState === "saving"
                  ? "Updating..."
                  : " "}
            </p>

            <FitnessButton
              type="button"
              onClick={vm.changePassword}
              disabled={!vm.canChangePassword || vm.passwordState === "saving"}
              className="h-11 w-full px-5 sm:w-auto"
              variant={vm.canChangePassword ? "primary" : "ghost"}
            >
              Change password
            </FitnessButton>
          </div>
        </section>
      </div>
    </div>
  );
}
