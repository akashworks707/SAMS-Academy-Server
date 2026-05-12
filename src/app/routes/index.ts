import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { ZoomRoutes } from "../modules/zoom/zoom.routes";

export const router = Router();

const moduleRoutes = [
    {
        path: "/user",
        route: userRoutes
    },
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/zoom",
        route: ZoomRoutes
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})