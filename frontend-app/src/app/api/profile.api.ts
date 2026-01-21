import { UserProfile } from "@/types/pages/profilePage";
import {
  GetProfileDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
} from "@/types/profile/profileDTO";
import { profileMock } from "./apiMock/profile/profile.mock";
import { profileReal } from "./apiReal/profile.real";


const mode = process.env.NEXT_PUBLIC_API_MODE;
const impl = mode === "mock" ? profileMock : profileReal;

export const getProfileApi = (payload: GetProfileDTO): Promise<UserProfile> =>
  impl.getProfile(payload);

export const updateProfileApi = (
  payload: UpdateProfileDTO,
): Promise<UserProfile> => impl.updateProfile(payload);

export const changePasswordApi = (
  payload: ChangePasswordDTO,
): Promise<boolean> => impl.changePassword(payload);
