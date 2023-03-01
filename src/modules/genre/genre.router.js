import { Router } from 'express'
import auth from './../../middleware/auth.js';
import { genreRoles } from './genre.roles.js';
import * as genreController from './controller/genre.js'
import { myMulter, fileFormat } from './../../services/multer.js';
import { validation } from './../../middleware/validation.js';
import * as validators from './genre.validation.js'

const router = Router();

router.post("/add", myMulter(fileFormat.image).single('image'), validation(validators.add), auth(genreRoles.add), genreController.addGenre)
router.post("/add/:genreId/image", myMulter(fileFormat.image).single('image'), validation(validators.image), auth(genreRoles.add), genreController.addImage)
router.put("/update/:genreId", myMulter(fileFormat.image).single('image'), validation(validators.update), auth(genreRoles.update), genreController.updateGenre)
router.delete("/delete/:genreId", validation(validators.remove), auth(genreRoles.remove), genreController.deleteGenre)

export default router