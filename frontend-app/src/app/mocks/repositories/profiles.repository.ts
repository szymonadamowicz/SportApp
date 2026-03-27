import { readJson, writeJson } from "@/mocks/runtime/storage";
import { ProfileDTO, ProfilesDb } from "@/types/profile/profileDTO";

const PROFILES_KEY = "rf_mock_profiles_v1";

const readAll = (): ProfilesDb => readJson<ProfilesDb>(PROFILES_KEY, {});

const writeAll = (next: ProfilesDb) => {
  writeJson(PROFILES_KEY, next);
};

export const profilesRepository = {
  getByLogin(login: string): ProfileDTO {
    const all = readAll();
    return (
      all[login] ?? {
        name: "",
        email: "",
        birthDate: undefined,
      }
    );
  },

  upsert(login: string, patch: Partial<ProfileDTO>): ProfileDTO {
    const all = readAll();

    const next: ProfileDTO = {
      ...this.getByLogin(login),
      ...patch,
    };

    all[login] = next;
    writeAll(all);

    return next;
  },
};
