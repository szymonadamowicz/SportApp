import { httpClient } from "../httpClient";
import {
  ChangePasswordDTO,
  ProfileDTO,
  UpdateProfileDTO,
} from "@/types/profile/profileDTO";

export const profileReal = {
  async getProfile(): Promise<ProfileDTO> {
    return httpClient<ProfileDTO>("/profile");
  },

  async updateProfile(payload: UpdateProfileDTO): Promise<ProfileDTO> {
    return httpClient<ProfileDTO>("/profile/update-profile", {
      method: "PATCH",
      body: payload,
    });
  },

  async changePassword(payload: ChangePasswordDTO): Promise<void> {
    return httpClient<void>("/profile/change-password", {
      method: "POST",
      body: payload,
    });
  },
};
