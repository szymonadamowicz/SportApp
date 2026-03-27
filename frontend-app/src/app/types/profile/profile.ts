export type Profile = {
  name?: string;
  email?: string;
  birthDate?: string;
};

export type SaveState = "idle" | "saving" | "success" | "error";
export type VerifyState = "idle" | "verifying" | "verified" | "error";
export type PasswordState = "idle" | "saving" | "success" | "error";
