import {
  UpdateProfileDTO,
  ChangePasswordDTO,
  ProfileDTO,
} from "@/types/profile/profileDTO";
import { profileMock } from "./apiMock/profile/profile.mock";
import { profileReal } from "./apiReal/profile.real";

const mode = process.env.NEXT_PUBLIC_API_MODE;
const impl = mode === "mock" ? profileMock : profileReal;

export const getProfileApi = (): Promise<ProfileDTO> => impl.getProfile();

export const updateProfileApi = (
  payload: UpdateProfileDTO,
): Promise<ProfileDTO> => impl.updateProfile(payload);

export const changePasswordApi = (payload: ChangePasswordDTO): Promise<void> =>
  impl.changePassword(payload);
