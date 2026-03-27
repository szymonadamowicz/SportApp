import { getMockLoginFromToken } from "@/contexts/auth/authMock";
import { profilesRepository } from "@/mocks/repositories/profiles.repository";
import { usersRepository } from "@/mocks/repositories/users.repository";
import { mockDelay } from "@/mocks/runtime/delay";
import {
  ChangePasswordDTO,
  ProfileDTO,
  UpdateProfileDTO,
} from "@/types/profile/profileDTO";

export const mockProfileService = {
  async getProfile(): Promise<ProfileDTO> {
    await mockDelay(120);
    const login = getMockLoginFromToken();
    return profilesRepository.getByLogin(login);
  },

  async updateProfile(payload: UpdateProfileDTO): Promise<ProfileDTO> {
    await mockDelay(160);
    const login = getMockLoginFromToken();
    return profilesRepository.upsert(login, payload);
  },

  async changePassword(payload: ChangePasswordDTO): Promise<void> {
    await mockDelay(180);

    const login = getMockLoginFromToken();
    const user = usersRepository.getByLogin(login);

    if (!user) throw new Error("User not found");
    if (user.password !== payload.currentPassword) {
      throw new Error("Invalid current password");
    }

    usersRepository.updatePassword(login, payload.newPassword);
  },
};
