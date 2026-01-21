import { UserProfile } from "@/types/pages/profilePage";
import {
  GetProfileDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
} from "@/types/profile/profileDTO";

export const profileReal = {
  async getProfile(payload: GetProfileDTO): Promise<UserProfile> {
    throw new Error("profileReal.getProfile not implemented");
  },

  async updateProfile(payload: UpdateProfileDTO): Promise<UserProfile> {
    throw new Error("profileReal.updateProfile not implemented");
  },

  async changePassword(payload: ChangePasswordDTO): Promise<boolean> {
    throw new Error("profileReal.changePassword not implemented");
  },
};
