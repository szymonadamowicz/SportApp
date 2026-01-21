import { UserProfile } from "@/types/pages/profilePage";
import { GetProfileDTO, UpdateProfileDTO, ChangePasswordDTO } from "@/types/profile/profileDTO";
import { profileMockDb } from "./profile.mockDb";

export const profileMock = {
  getProfile(payload: GetProfileDTO): Promise<UserProfile> {
    return profileMockDb.getProfile(payload);
  },

  updateProfile(payload: UpdateProfileDTO): Promise<UserProfile> {
    return profileMockDb.updateProfile(payload);
  },

  changePassword(payload: ChangePasswordDTO): Promise<boolean> {
    return profileMockDb.changePassword(payload);
  },
};
