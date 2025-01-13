export interface JWTPayload {
	sub: string;
	email: string;
	role: string;
	iat?: number;
	exp?: number;
}

export type AuthType = {
	user: JWTPayload;
};
