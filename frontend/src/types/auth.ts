export enum Role {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_SUPERADMIN = 'ROLE_SUPERADMIN',
}

export interface UserInfo {
  id: string;
  empno: number;
  name: string;
  role: Role;
  departmentName?: string;
  jobgradeName?: string;
  positionName?: string;
}

export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
}
