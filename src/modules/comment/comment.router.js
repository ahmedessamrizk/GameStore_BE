import { Router } from 'express'
import * as commentController from './controller/comment.js'
import { commentRoles } from './comment.roles.js';
import auth from '../../middleware/auth.js';
import { validation } from './../../middleware/validation.js';
import * as commentValidators from './comment.validation.js'

const router = Router({ mergeParams: true })

//addComment
router.post('/add', validation(commentValidators.addComment), auth(commentRoles.All), commentController.addComment)

//removeComment
router.delete('/:commentId', validation(commentValidators.removeOrUpdateComment), auth(commentRoles.All), commentController.removeComment)

//updateComment
router.put('/:commentId', validation(commentValidators.removeOrUpdateComment), auth(commentRoles.All), commentController.updateComment)

//getComments
router.get('/', validation(commentValidators.getComments), commentController.getComments)

export default router
