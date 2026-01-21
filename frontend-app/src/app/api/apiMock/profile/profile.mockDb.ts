import { LoginDTO } from "@/types/login/loginDTO";
import {
  ChangePasswordDTO,
  GetProfileDTO,
  UpdateProfileDTO,
} from "@/types/profile/profileDTO";
import { loginUserSeed } from "../login/login.seed";
import { UserProfile } from "@/types/pages/profilePage";
import { UsersDb } from "@/types/login/login";
import { ProfilesDb } from "@/types/profile/profile";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const USERS_KEY = "rf_mock_users_v1";
const PROFILES_KEY = "rf_mock_profiles_v1";

const safeRead = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const seedUsersIfEmpty = () => {
  const users = safeRead<UsersDb>(USERS_KEY, {});
  if (Object.keys(users).length > 0) return;

  const seeded: UsersDb = {};
  for (const u of loginUserSeed as LoginDTO[]) {
    seeded[u.login] = { password: u.password };
  }
  safeWrite(USERS_KEY, seeded);
};

const readUsers = (): UsersDb => {
  seedUsersIfEmpty();
  return safeRead<UsersDb>(USERS_KEY, {});
};

const writeUsers = (db: UsersDb) => safeWrite(USERS_KEY, db);

const readProfiles = (): ProfilesDb => safeRead<ProfilesDb>(PROFILES_KEY, {});
const writeProfiles = (db: ProfilesDb) => safeWrite(PROFILES_KEY, db);

export const profileMockDb = {
  async getProfile(payload: GetProfileDTO): Promise<UserProfile> {
    await delay(120);

    const login = payload?.login?.trim();
    if (!login) {
      return { login: "" };
    }

    const profiles = readProfiles();
    const existing = profiles[login];
    return existing ?? { login };
  },

  async updateProfile(payload: UpdateProfileDTO): Promise<UserProfile> {
    await delay(160);

    const login = payload?.login?.trim();
    if (!login) {
      return { login: "" };
    }

    const profiles = readProfiles();
    const prev = profiles[login] ?? { login };

    const next: UserProfile = {
      login,
      name: payload.name?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      birthDate: payload.birthDate?.trim() || undefined,
    };

    profiles[login] = { ...prev, ...next };
    writeProfiles(profiles);

    return profiles[login];
  },

  async changePassword(payload: ChangePasswordDTO): Promise<boolean> {
    await delay(180);

    const login = payload?.login?.trim();
    const currentPassword = payload?.currentPassword ?? "";
    const newPassword = payload?.newPassword ?? "";

    if (!login || !currentPassword || !newPassword) return false;
    if (newPassword.length < 4) return false;

    const users = readUsers();
    const user = users[login];
    if (!user) return false;
    if (user.password !== currentPassword) return false;

    users[login] = { password: newPassword };
    writeUsers(users);
    return true;
  },
};
