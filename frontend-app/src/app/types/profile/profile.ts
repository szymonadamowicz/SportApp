import { UserProfile } from "../pages/profilePage";

export type UsersDb = Record<string, { password: string }>;
export type ProfilesDb = Record<string, UserProfile>;

export type SaveState = "idle" | "saving" | "success" | "error";
export type VerifyState = "idle" | "verifying" | "verified" | "error";
export type PasswordState = "idle" | "saving" | "success" | "error";
