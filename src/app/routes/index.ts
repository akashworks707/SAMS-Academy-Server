import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { ZoomRoutes } from "../modules/zoom/zoom.routes";
import { classRoutes } from "../modules/class/class.route";
import { subjectRoutes } from "../modules/subject/subject.route";

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
    },
    {
        path: "/class",
        route: classRoutes
    },
    {
        path: "/subject",
        route: subjectRoutes
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})