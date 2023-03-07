import { Router } from 'express'
import auth from '../../middleware/auth.js';
import { rateRoles } from './rate.roles.js';
import * as rateController from './controller/rate.js'
import { allRoles } from './../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import * as rateValidators from './rate.validation.js'

const router = Router({ mergeParams: true });

router.post("/add", validation(rateValidators.addRate), auth(allRoles), rateController.addRate)

export default router

