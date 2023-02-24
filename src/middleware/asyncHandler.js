//This function to avoid writing try catch in its end point
export const asyncHandler = (fn) => {
    return async(req, res, next) => {
        try {
             await fn(req, res, next);
        } catch (error) {
            return next(new Error(error, { cause: 500 }))
        }
        // fn(req, res, next).catch(err => {
        //     next(new Error(err, { cause: 500 }))
        // })
    }
}

export const globalErrorHandling = (err, req, res, next) => {
    if (err) {
        if (process.env.MOOD === "DEV") {
            return res.status(err['cause'] || 500).json({ message: err.message })

        } else {
            return res.status(err['cause'] || 500).json({ message: err.message })
        }
    }
}