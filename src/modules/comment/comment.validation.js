import joi from 'joi'

export const addComment = {
    body: joi.object().required().keys({
        body: joi.string().required(),
    }),
    params: joi.object().required().keys({
        gameId: joi.string().min(24).max(24).required(),
    })
}

export const removeOrUpdateComment = {
    params: joi.object().required().keys({
        gameId: joi.string().min(24).max(24).required(),
        commentId: joi.string().min(24).max(24).required()
    })
}

export const getComments = {
    params: joi.object().required().keys({
        gameId: joi.string().min(24).max(24).required()
    })
}