import { Elysia, t } from "elysia";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { AuthType } from "../types/auth";

export const userController = new Elysia({ prefix: "/users" })
	.use(authMiddleware)
	.get(
		"/",
		async ({ user }: AuthType) => {
			if (user.role !== "ADMIN") {
				throw new Error("Forbidden: Insufficient permissions");
			}

			return await prisma.user.findMany({
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
					updatedAt: true,
				},
			});
		},
		{
			detail: {
				tags: ["Users"],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id }, user }: AuthType & { params: { id: string } }) => {
			// Users can only access their own data unless they're admin
			if (user.role !== "ADMIN" && user.sub !== id) {
				throw new Error("Forbidden: Cannot access other user data");
			}

			const userData = await prisma.user.findUnique({
				where: { id },
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!userData) {
				throw new Error("User not found");
			}

			return userData;
		},
		{
			detail: {
				tags: ["Users"],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.patch(
		"/:id",
		async ({
			params: { id },
			body,
			user,
		}: AuthType & {
			params: { id: string };
			body: Partial<{ name: string; email: string }>;
		}) => {
			// Users can only update their own data unless they're admin
			if (user.role !== "ADMIN" && user.sub !== id) {
				throw new Error("Forbidden: Cannot modify other user data");
			}

			const updatedUser = await prisma.user.update({
				where: { id },
				data: body,
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			return updatedUser;
		},
		{
			detail: {
				tags: ["Users"],
				security: [{ bearerAuth: [] }],
			},
		},
	)
	.delete(
		"/:id",
		async ({
			params: { id },
			user,
		}: AuthType & {
			params: { id: string };
		}) => {
			// Only admins can delete users
			if (user.role !== "ADMIN") {
				throw new Error("Forbidden: Only admins can delete users");
			}

			await prisma.user.delete({
				where: { id },
			});

			return { message: "User deleted successfully" };
		},
		{
			detail: {
				tags: ["Users"],
				security: [{ bearerAuth: [] }],
			},
		},
	);
