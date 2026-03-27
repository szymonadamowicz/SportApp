import { loginUsersFixture } from "@/mocks/fixtures/loginUsers.fixture";
import { readJson, writeJson } from "@/mocks/runtime/storage";
import { UsersDb } from "@/types/login/login";

const USERS_KEY = "rf_mock_users_v1";

const ensureSeeded = () => {
  const current = readJson<UsersDb>(USERS_KEY, {});
  if (Object.keys(current).length > 0) return;

  const seeded: UsersDb = {};
  for (const user of loginUsersFixture) {
    seeded[user.login] = { password: user.password };
  }

  writeJson(USERS_KEY, seeded);
};

const readAll = (): UsersDb => {
  ensureSeeded();
  return readJson<UsersDb>(USERS_KEY, {});
};

const writeAll = (next: UsersDb) => {
  writeJson(USERS_KEY, next);
};

export const usersRepository = {
  getAll(): UsersDb {
    return readAll();
  },

  getByLogin(login: string): { password: string } | undefined {
    return readAll()[login];
  },

  create(login: string, password: string): boolean {
    const users = readAll();
    if (users[login]) return false;

    users[login] = { password };
    writeAll(users);
    return true;
  },

  updatePassword(login: string, password: string): boolean {
    const users = readAll();
    if (!users[login]) return false;

    users[login] = { password };
    writeAll(users);
    return true;
  },
};
