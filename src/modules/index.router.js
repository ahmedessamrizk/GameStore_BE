import authRouter from './auth/auth.router.js'
import userRouter from './user/user.router.js'
import gameRouter from './game/game.router.js'
import rateRouter from './rate/rate.router.js'
import commentRouter from './comment/comment.router.js'
import genreRouter from './genre/genre.router.js'
import cartRouter from './cart/cart.router.js'
import morgan from 'morgan'
import cors from 'cors'
import express from 'express'
import passport from 'passport'
import * as passportSetup from '../services/passportSetup.js'
import { connectDB } from '../../DB/connection.js'
import { globalErrorHandling } from '../middleware/asyncHandler.js'
import { superAdmin } from '../services/superAdmin.js'



export const appRouter = (app) => {
    app.use(express.json({}));
    app.use(express.urlencoded({ extended: true }))
    app.use(passport.initialize())
    app.use(cors({}));

    //superAdmins
    superAdmin([process.env.SUPERADMINONE, process.env.SUPERADMINTWO, process.env.SUPERADMINTHREE]);
    //Returns request endpoint and time taken to execute it
    if (process.env.MODE === 'DEV') {
        app.use(morgan("dev"))
    } else {
        app.use(morgan("combined"))
    }

    //Base URL
    const baseURL = process.env.BASEURL

    //Api Setup
    app.use(`${baseURL}/auth`, authRouter);
    app.use(`${baseURL}/user`, userRouter);
    app.use(`${baseURL}/game`, gameRouter);
    app.use(`${baseURL}/genre`, genreRouter);
    app.use(`${baseURL}/cart`, cartRouter);
    app.use(`${baseURL}/rate`, rateRouter);
    app.use(`${baseURL}/comment`, commentRouter);

    //Invalid routing
    app.use('*', (req, res, next) => {

        app.use(morgan("dev"))

        //res.status(404).json({ message: "Invalid Routing" })
        next(Error("404 Page not found In-valid Routing or method", { cause: 404 }))
    })

    //Error handling  
    app.use(globalErrorHandling);

    //Connection on DB
    connectDB();

    /*  if needed
    import path from 'path'
    import { fileURLToPath } from 'url'
    const dirname = path.dirname(fileURLToPath(import.meta.url))
    dotenv.config({ path: path.join(dirname, '.import { passport } from 'passport';
/config/.env') })
    */
}
