export type GetProfileDTO = {
  login: string;
};

export type UpdateProfileDTO = {
  login: string;
  name?: string;
  email?: string;
  birthDate?: string;
};

export type ChangePasswordDTO = {
  login: string;
  currentPassword: string;
  newPassword: string;
};
