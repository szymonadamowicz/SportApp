export type ProfileDTO = {
  name?: string;
  email?: string;
  birthDate?: string;
};

export type UpdateProfileDTO = Partial<
  Pick<ProfileDTO, "name" | "email" | "birthDate">
>;


export type ChangePasswordDTO = {
  currentPassword: string;
  newPassword: string;
};
