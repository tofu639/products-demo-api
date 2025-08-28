export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
  expiresIn: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  saltRounds: number;
}