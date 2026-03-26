import {
  UpdateProfileDTO,
  ChangePasswordDTO,
  ProfileDTO,
} from "@/types/profile/profileDTO";
import { profileMock } from "./apiMock/profile/profile.mock";
import { profileReal } from "./apiReal/profile.real";
import { API_MODE } from "./env";

const impl = API_MODE === "mock" ? profileMock : profileReal;

export const getProfileApi = (): Promise<ProfileDTO> => impl.getProfile();

export const updateProfileApi = (
  payload: UpdateProfileDTO,
): Promise<ProfileDTO> => impl.updateProfile(payload);

export const changePasswordApi = (payload: ChangePasswordDTO): Promise<void> =>
  impl.changePassword(payload);
