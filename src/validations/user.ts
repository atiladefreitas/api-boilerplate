import { t } from "elysia";

export const createUserSchema = t.Object({
	email: t.String({ format: "email" }),
	name: t.String({ minLength: 2 }),
	password: t.String({ minLength: 6 }),
});

export const updateUserSchema = t.Partial(
	t.Object({
		email: t.String({ format: "email" }),
		name: t.String({ minLength: 2 }),
		password: t.String({ minLength: 6 }),
	}),
);
