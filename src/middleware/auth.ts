import { Elysia } from "elysia";
import { jwtSetup } from "../lib/jwt";
import { AuthType, JWTPayload } from "../types/auth";

export const authMiddleware = new Elysia()
	.use(jwtSetup)
	.derive(async ({ jwt, headers }): Promise<AuthType> => {
		const authHeader = headers.authorization;

		if (!authHeader?.startsWith("Bearer ")) {
			throw new Error("Unauthorized: No token provided");
		}

		const token = authHeader.split(" ")[1];
		const payload = (await jwt.verify(token)) as JWTPayload;

		if (!payload) {
			throw new Error("Unauthorized: Invalid token");
		}

		return { user: payload };
	});
