import { t } from "elysia";

export const addressSchema = t.Object({
	street: t.String(),
	number: t.String(),
	complement: t.Optional(t.String()),
	neighborhood: t.String(),
	city: t.String(),
	state: t.String(),
	country: t.String(),
	zipCode: t.String(),
}); 