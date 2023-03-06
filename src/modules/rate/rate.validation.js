import joi from 'joi'

export const addRate = {
    params: joi.object().required().keys({
        gameId: joi.string().min(24).max(24).required(),
    }),
    body: joi.object().required().keys({
        rate: joi.number().min(0).max(5).required()
    }),
}