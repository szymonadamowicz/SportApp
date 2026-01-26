export type AuthUser = {
  login: string;
};

export type AuthSession = {
  user?: AuthUser;
  accessToken: string;
};

export type AuthLoginPayload = {
  login: string;
  password: string;
};

export type AuthRegisterPayload = {
  login: string;
  password: string;
  repeatPassword: string;
};

export type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  session: AuthSession | null;

  login: (payload: AuthLoginPayload) => Promise<void>;
  register: (payload: AuthRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};
