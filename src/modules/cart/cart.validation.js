import joi from 'joi'

export const addOrRemoveCart = {
    params: joi.object().required().keys({
        gameId: joi.string().min(24).max(24).required()
    })
}
