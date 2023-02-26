import jwt from 'jsonwebtoken'
import userModel from '../../DB/models/user.model.js';
import { asyncHandler } from './asyncHandler.js';

export const roles = {
    admin: "admin",
    user: "user",
    superAdmin: "superAdmin"
}
export const allRoles = [roles.admin, roles.user, roles.superAdmin]

const auth = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers
        if (authorization.startsWith(process.env.BEARERKEY)) {
            const decoded = jwt.verify(authorization.split(process.env.BEARERKEY)[1], process.env.SIGNINKEY)
            if (decoded?._id) {
                const user = await userModel.findOne({ _id: decoded._id }).select("role userName isBlocked confirmEmail isDeleted")
                if (user) {
                    const { err, cause } = checkUser(user, ['isDeleted', 'isBlocked', 'confirmEmail'])
                    if (!err) {
                        if (accessRoles.includes(user.role)) {
                            req.user = { _id: user._id, role: user.role, userName: user.userName }
                            next()
                        } else {
                            next(Error("you don't have the permission", { cause: 403 }))

                        }
                    } else {
                        next(Error(" the current signed User :" + err, { cause }))
                    }


                } else {
                    next(Error("This user was deleted or blocked or not confirmed yet, please contact the administrator", { cause: 401 }))

                }
            } else {
                next(Error("authorization error (payload)", { cause: 401 }))

            }
        } else {
            // res.status(401).json({ message: "authorization error (bearerKey)" })
            next(Error("authorization error (bearerKey)", { cause: 401 }))

        }

    }
    )
}

export default auth
