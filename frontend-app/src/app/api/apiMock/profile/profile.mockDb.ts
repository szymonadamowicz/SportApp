import { LoginDTO } from "@/types/login/loginDTO";
import {
  ChangePasswordDTO,
  ProfileDTO,
  UpdateProfileDTO,
} from "@/types/profile/profileDTO";
import { loginUserSeed } from "../login/login.seed";
import { UsersDb } from "@/types/login/login";
import { getMockLoginFromToken } from "@/contexts/auth/authMock";

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
const readProfiles = (): Record<string, ProfileDTO> =>
  safeRead(PROFILES_KEY, {});

const writeProfiles = (db: Record<string, ProfileDTO>) =>
  safeWrite(PROFILES_KEY, db);

export const profileMockDb = {
  async getProfile(): Promise<ProfileDTO> {
    await delay(120);

    const login = getMockLoginFromToken();
    const profiles = readProfiles();

    return (
      profiles[login] ?? {
        name: "",
        email: "",
        birthDate: undefined,
      }
    );
  },

  async updateProfile(payload: UpdateProfileDTO): Promise<ProfileDTO> {
    await delay(160);

    const login = getMockLoginFromToken();
    const profiles = readProfiles();

    const prev = profiles[login] ?? {
      name: "",
      email: "",
      birthDate: undefined,
    };

    const next: ProfileDTO = {
      ...prev,
      ...payload,
    };

    profiles[login] = next;
    writeProfiles(profiles);

    return next;
  },

  async changePassword(payload: ChangePasswordDTO): Promise<void> {
    await delay(180);

    const login = getMockLoginFromToken();
    const users = readUsers();

    const user = users[login];
    if (!user) throw new Error("User not found");
    if (user.password !== payload.currentPassword) {
      throw new Error("Invalid current password");
    }

    users[login] = { password: payload.newPassword };
    writeUsers(users);
  },
};
