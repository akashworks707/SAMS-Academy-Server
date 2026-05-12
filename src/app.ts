import express, { Request, Response } from "express"
import { router } from "./app/routes"

import cors from "cors"
import cookieParser from "cookie-parser";
import { envVars } from "./app/config/env";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";


const app = express()

app.use(cors({
    origin: [
        "http://localhost:3000",
        envVars.FRONTEND_URL,
    ],
    credentials: true
}))
app.use(cookieParser());
app.use(express.json())


app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Coaching Center application is running!!!"
    })
})

app.use(globalErrorHandler)
app.use(notFound)

export default app;