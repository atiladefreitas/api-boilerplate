import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userController } from "./controllers/user.controller";
import { authController } from "./controllers/auth.controller";

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "User Management API",
					version: "1.0.0",
					description: "A scalable API built with Bun and Elysia",
				},
				tags: [
					{ name: "Auth", description: "Authentication endpoints" },
					{ name: "Users", description: "User management endpoints" },
				],
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
						},
					},
				},
			},
		}),
	)
	.use(authController)
	.use(userController)
	.listen(3000);

console.log(
	`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`,
);
