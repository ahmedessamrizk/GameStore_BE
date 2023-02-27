import joi from 'joi'

export const add = {
    body: joi.object().required().keys({
        name: joi.string().min(1).max(300).required(),
        desc: joi.string().min(1).max(300).required(),
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required()
    }).options({ allowUnknown: true })
}

export const update = {
    body: joi.object().required().keys({
        name: joi.string().min(1).max(300),
        desc: joi.string().min(1).max(300)
    }),
    params: joi.object().required().keys({
        genreId: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required()
    }).options({ allowUnknown: true })
}

export const remove = {
    params: joi.object().required().keys({
        genreId: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required()
    }).options({ allowUnknown: true })
}

export const image = {
    params: joi.object().required().keys({
        genreId: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required()
    }).options({ allowUnknown: true })
}
