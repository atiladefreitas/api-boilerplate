import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

export const jwtSetup = new Elysia().use(
	jwt({
		name: "jwt",
		secret: process.env.JWT_SECRET || "your-super-secret-key",
		exp: "7d",
	}),
);
