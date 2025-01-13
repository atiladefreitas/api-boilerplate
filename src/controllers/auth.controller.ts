import { Elysia, t } from "elysia";
import { jwtSetup } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import prisma from "../lib/prisma";

const userResponseSchema = t.Object({
	id: t.String(),
	email: t.String(),
	name: t.String(),
	role: t.String(),
	createdAt: t.String(),
	updatedAt: t.String(),
});

const loginResponseSchema = t.Object({
	token: t.String(),
	user: userResponseSchema,
});

export const authController = new Elysia()
	.use(jwtSetup)
	.onError(({ code, error }) => {
		return new Response(
			JSON.stringify({
				message: error instanceof Error ? error.message : "An error occurred",
			}),
			{
				status: code === "NOT_FOUND" ? 404 : 400,
				headers: {
					"content-type": "application/json",
				},
			},
		);
	})
	.post(
		"/auth/register",
		async ({ body, jwt }) => {
			try {
				const { email, password, name } = body;

				// Check if user exists
				const existingUser = await prisma.user.findUnique({
					where: { email },
				});

				if (existingUser) {
					throw new Error("User already exists");
				}

				// Create new user
				const hashedPassword = await hashPassword(password);
				const user = await prisma.user.create({
					data: {
						email,
						password: hashedPassword,
						name,
						role: "USER",
					},
				});

				const payload = {
					sub: user.id,
					email: user.email,
					role: user.role,
				};

				const token = await jwt.sign(payload);

				return {
					token,
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						createdAt: user.createdAt.toISOString(),
						updatedAt: user.updatedAt.toISOString(),
					},
				};
			} catch (error) {
				throw new Error(
					error instanceof Error ? error.message : "Registration failed",
				);
			}
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 6 }),
				name: t.String({ minLength: 2 }),
			}),
			response: loginResponseSchema,
			detail: {
				tags: ["Auth"],
				summary: "Register a new user",
				description:
					"Creates a new user account and returns an authentication token",
			},
		},
	)
	.post(
		"/auth/login",
		async ({ body, jwt }) => {
			try {
				const { email, password } = body;

				const user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user || !(await verifyPassword(password, user.password))) {
					throw new Error("Invalid credentials");
				}

				const payload = {
					sub: user.id,
					email: user.email,
					role: user.role,
				};

				const token = await jwt.sign(payload);

				return {
					token,
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						createdAt: user.createdAt.toISOString(),
						updatedAt: user.updatedAt.toISOString(),
					},
				};
			} catch (error) {
				throw new Error(
					error instanceof Error ? error.message : "Login failed",
				);
			}
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String(),
			}),
			response: loginResponseSchema,
			detail: {
				tags: ["Auth"],
				summary: "Login user",
				description: "Authenticates a user and returns a JWT token",
			},
		},
	)
	.post(
		"/auth/verify",
		async ({ headers, jwt }) => {
			try {
				const authHeader = headers.authorization;

				if (!authHeader?.startsWith("Bearer ")) {
					throw new Error("No token provided");
				}

				const token = authHeader.split(" ")[1];
				const payload = await jwt.verify(token);

				if (!payload) {
					throw new Error("Invalid token");
				}

				const user = await prisma.user.findUnique({
					where: { id: payload.sub as string },
				});

				if (!user) {
					throw new Error("User not found");
				}

				return {
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						createdAt: user.createdAt.toISOString(),
						updatedAt: user.updatedAt.toISOString(),
					},
				};
			} catch (error) {
				throw new Error(
					error instanceof Error ? error.message : "Token verification failed",
				);
			}
		},
		{
			response: t.Object({
				user: userResponseSchema,
			}),
			detail: {
				tags: ["Auth"],
				summary: "Verify JWT token",
				description: "Verifies the JWT token and returns the user information",
			},
		},
	)
	.patch(
		"/auth/change-password",
		async ({ body, headers, jwt }) => {
			try {
				const { currentPassword, newPassword } = body;

				const authHeader = headers.authorization;

				if (!authHeader?.startsWith("Bearer ")) {
					throw new Error("No token provided");
				}

				const token = authHeader.split(" ")[1];
				const payload = await jwt.verify(token);

				if (!payload) {
					throw new Error("Invalid token");
				}

				const user = await prisma.user.findUnique({
					where: { id: payload.sub as string },
				});

				if (!user || !(await verifyPassword(currentPassword, user.password))) {
					throw new Error("Invalid current password");
				}

				const hashedPassword = await hashPassword(newPassword);

				await prisma.user.update({
					where: { id: user.id },
					data: { password: hashedPassword },
				});

				return { message: "Password updated successfully" };
			} catch (error) {
				throw new Error(
					error instanceof Error ? error.message : "Password change failed",
				);
			}
		},
		{
			body: t.Object({
				currentPassword: t.String(),
				newPassword: t.String({ minLength: 6 }),
			}),
			response: t.Object({
				message: t.String(),
			}),
			detail: {
				tags: ["Auth"],
				summary: "Change password",
				description: "Changes the user password",
				security: [{ bearerAuth: [] }],
			},
		},
	);
