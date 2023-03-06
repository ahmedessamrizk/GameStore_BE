import { Router } from 'express'
import * as commentController from './controller/comment.js'
import { commentRoles } from './comment.roles.js';
import auth from '../../middleware/auth.js';

const router = Router({mergeParams: true})

//addComment
router.post('/add', auth(commentRoles.All), commentController.addComment)

//removeComment
router.delete('/:commentId', auth(commentRoles.All), commentController.removeComment)

//updateComment
router.put('/:commentId', auth(commentRoles.All), commentController.updateComment)

//getComments
router.get('/', commentController.getComments)

export default router