export interface User {
	id: string;
	email: string;
	name: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
}

export type CreateUserDTO = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserDTO = Partial<
	Omit<User, "id" | "createdAt" | "updatedAt">
>;
