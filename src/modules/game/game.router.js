import { Router } from 'express'
import auth from '../../middleware/auth.js';
import { gameRoles } from './game.roles.js';
import { myMulter, fileFormat } from './../../services/multer.js';
import * as gameController from './controller/game.js'
import * as commentController from './controller/comment.js'
import rateRouter from './../rate/rate.router.js'

const router = Router();

//router to rate API
router.use("/:gameId/rate",rateRouter )

// Add Game Data
router.post('/add',
    myMulter(fileFormat.image).single('mainPic'),
    auth(gameRoles.A_SA),
    gameController.addGame
)
router.post('/:gameId/add/pics',
    myMulter(fileFormat.image).array('pics', 5),
    auth(gameRoles.A_SA),
    gameController.addGamePics
)
router.post('/:gameId/add/video',
    myMulter(fileFormat.video).single('video'),
    auth(gameRoles.A_SA),
    gameController.addGameVid
)

//Delete Game
router.patch('/:gameId/delete', auth(gameRoles.A_SA), gameController.removeGame)

//Update Game
router.put('/:gameId/update',
    myMulter(fileFormat.image).single('mainPic'),
    auth(gameRoles.A_SA),
    gameController.updateGame)



//Comment API 
//addComment
router.post('/:gameId/comment', auth(gameRoles.All), commentController.addComment)

//removeComment
router.delete('/:gameId/comment/:commentId', auth(gameRoles.All), commentController.removeComment)

//updateComment
router.put('/:gameId/comment/:commentId', auth(gameRoles.All), commentController.updateComment)

//getComments
router.get('/:gameId/comment', commentController.getComments)

//ratings
// router.patch('/:gameId/rate', auth(allRoles), gameController.addRate)

export default router