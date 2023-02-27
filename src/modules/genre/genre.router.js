import { Router } from 'express'
import auth from './../../middleware/auth.js';
import { genreRoles } from './genre.roles.js';
import * as genreController from './controller/genre.js'
import { myMulter, fileFormat } from './../../services/multer.js';
import { validation } from './../../middleware/validation.js';
import * as validators from './genre.validation.js'

const router = Router();

router.post("/add", validation(validators.add), auth(genreRoles.add), myMulter(fileFormat.image).single('image'), genreController.addGenre)
router.post("/add/:genreId/image",validation(validators.image), auth(genreRoles.add), myMulter(fileFormat.image).single('image'), genreController.addImage)
router.put("/update/:genreId", validation(validators.update), auth(genreRoles.update), myMulter(fileFormat.image).single('image'), genreController.updateGenre)
router.delete("/delete/:genreId", validation(validators.remove), auth(genreRoles.remove), genreController.deleteGenre)

export default router