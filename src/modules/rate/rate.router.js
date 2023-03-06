import { Router } from 'express'
import auth from '../../middleware/auth.js';
import { rateRoles } from './rate.roles.js';
import * as rateController from './controller/rate.js'
import { allRoles } from './../../middleware/auth.js';

const router = Router({ mergeParams: true });

router.post("/add", auth(allRoles), rateController.addRate)

export default router