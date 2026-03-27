import {
  ChangePasswordDTO,
  ProfileDTO,
  UpdateProfileDTO,
} from "@/types/profile/profileDTO";
import { mockProfileService } from "@/mocks/services/mockProfile.service";

export const profileMock = {
  getProfile(): Promise<ProfileDTO> {
    return mockProfileService.getProfile();
  },

  updateProfile(payload: UpdateProfileDTO): Promise<ProfileDTO> {
    return mockProfileService.updateProfile(payload);
  },

  changePassword(payload: ChangePasswordDTO): Promise<void> {
    return mockProfileService.changePassword(payload);
  },
};
