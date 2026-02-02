// CredentialsModel.ts
export interface CredentialsModel {
  email_or_username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}