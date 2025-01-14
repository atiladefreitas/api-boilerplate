import { t } from "elysia";
import { addressSchema } from "./address";

export const userResponseSchema = t.Object({
	id: t.String(),
	email: t.String(),
	name: t.String(),
	document: t.String(),
	birthday: t.String(),
	role: t.String(),
	createdAt: t.String(),
	updatedAt: t.String(),
	address: t.Optional(addressSchema),
});

export const createUserSchema = t.Object({
	email: t.String({ format: "email" }),
	name: t.String({ minLength: 2 }),
	password: t.String({ minLength: 6 }),
	document: t.String(),
	birthday: t.Date(),
	address: t.Optional(addressSchema),
});

export const updateUserSchema = t.Partial(
	t.Object({
		email: t.String({ format: "email" }),
		name: t.String({ minLength: 2 }),
		password: t.String({ minLength: 6 }),
		address: addressSchema,
	}),
);
