export interface Address {
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	country: string;
	zipCode: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
	password: string;
	address?: Address;
	addressId?: string;
	document?: string;
	birthday?: string;
	createdAt: Date;
	updatedAt: Date;
}

export type CreateUserDTO = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserDTO = Partial<
	Omit<User, "id" | "createdAt" | "updatedAt">
>;
