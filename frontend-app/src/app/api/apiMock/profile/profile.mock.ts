import {
  ChangePasswordDTO,
  ProfileDTO,
  UpdateProfileDTO,
} from "@/types/profile/profileDTO";
import { profileMockDb } from "./profile.mockDb";

export const profileMock = {
  getProfile(): Promise<ProfileDTO> {
    return profileMockDb.getProfile();
  },

  updateProfile(payload: UpdateProfileDTO): Promise<ProfileDTO> {
    return profileMockDb.updateProfile(payload);
  },

  changePassword(payload: ChangePasswordDTO): Promise<void> {
    return profileMockDb.changePassword(payload);
  },
};
