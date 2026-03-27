import { profilesRepository } from "@/mocks/repositories/profiles.repository";

const PROFILES_KEY = "rf_mock_profiles_v1";

describe("profilesRepository", () => {
  beforeEach(() => {
    localStorage.removeItem(PROFILES_KEY);
  });

  it("returns empty profile for user without profile", () => {
    const profile = profilesRepository.getByLogin("unknown");

    expect(profile).toEqual({
      name: "",
      email: "",
      birthDate: undefined,
    });
  });

  it("upserts profile fields", () => {
    const updated = profilesRepository.upsert("john", {
      name: "John Doe",
      email: "john@fit.local",
    });

    expect(updated).toEqual({
      name: "John Doe",
      email: "john@fit.local",
      birthDate: undefined,
    });

    expect(profilesRepository.getByLogin("john")).toEqual(updated);
  });

  it("merges partial updates with existing data", () => {
    profilesRepository.upsert("john", {
      name: "John Doe",
      email: "john@fit.local",
      birthDate: "2000-01-01",
    });

    const merged = profilesRepository.upsert("john", {
      email: "updated@fit.local",
    });

    expect(merged).toEqual({
      name: "John Doe",
      email: "updated@fit.local",
      birthDate: "2000-01-01",
    });
  });
});
