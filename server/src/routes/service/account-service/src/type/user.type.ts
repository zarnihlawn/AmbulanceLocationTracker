export interface CreateUserDto {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  nrc?: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  nrc?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  nrc: string | null;
  phoneNumber: string | null;
  address: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  emailOrUsername?: string;
  password?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  resetToken: string;
  newPassword: string;
}
