export interface User {
	id: string;
	level?: number;
	email: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	nrc?: string;
	phoneNumber?: string;
	address?: string;
}

export interface LoginCredentials {
	emailOrUsername: string;
	password: string;
}

export type UserLevel = 1 | 2 | 3;

export interface RegisterData {
	email?: string;
	username?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	nrc?: string;
	phoneNumber?: string;
	address?: string;
}

export interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
	tokenType: string;
	expiresIn: number;
}

export interface AuthError {
	message: string;
	field?: string;
}

