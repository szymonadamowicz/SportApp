import { loginUsersFixture } from "@/mocks/fixtures/loginUsers.fixture";
import { usersRepository } from "@/mocks/repositories/users.repository";

const USERS_KEY = "rf_mock_users_v1";

describe("usersRepository", () => {
  beforeEach(() => {
    localStorage.removeItem(USERS_KEY);
  });

  it("seeds users from fixture on first read", () => {
    const seeded = usersRepository.getAll();
    const first = loginUsersFixture[0];

    expect(seeded[first.login]).toEqual({ password: first.password });
  });

  it("returns undefined for unknown login", () => {
    const user = usersRepository.getByLogin("missing-user");

    expect(user).toBeUndefined();
  });

  it("creates user and rejects duplicate login", () => {
    const created = usersRepository.create("new-user", "secret");
    const duplicated = usersRepository.create("new-user", "secret2");

    expect(created).toBe(true);
    expect(duplicated).toBe(false);
    expect(usersRepository.getByLogin("new-user")).toEqual({
      password: "secret",
    });
  });

  it("updates password only for existing user", () => {
    usersRepository.create("john", "old-pass");

    const updated = usersRepository.updatePassword("john", "new-pass");
    const missing = usersRepository.updatePassword("unknown", "new-pass");

    expect(updated).toBe(true);
    expect(missing).toBe(false);
    expect(usersRepository.getByLogin("john")).toEqual({
      password: "new-pass",
    });
  });
});
