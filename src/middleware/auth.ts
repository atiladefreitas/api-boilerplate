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
		let payload: JWTPayload;
		
		try {
			const verifiedToken = await jwt.verify(token);
			if (!verifiedToken || typeof verifiedToken !== 'object') {
				throw new Error("Invalid token verification result");
			}
			
			payload = {
				sub: verifiedToken.sub as string,
				email: verifiedToken.email as string,
				role: verifiedToken.role as string,
				iat: verifiedToken.iat as number,
				exp: verifiedToken.exp as number
			};
			
			if (!payload.role) {
				throw new Error("Invalid token payload structure");
			}
		} catch (error) {
			console.error("JWT verification failed:", error);
			throw new Error("Unauthorized: Invalid token");
		}

		return { user: payload };
	});
