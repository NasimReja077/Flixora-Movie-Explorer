import express from 'express';
import { addFavorite, removeFavorite, getFavorites, checkFavorite } from '../controllers/favorite.controller.js';
import protect from '../middlewares/auth.middleware.js';
import{ addFavoriteValidator,  movieIdParamValidator } from '../validators/favorite.validator.js';
import validate from '../middlewares/validationMiddleware.js';

const router = express.Router();


// All routes are protected
// router.use(protect);

router.post('/', protect, addFavoriteValidator, validate, addFavorite);
router.get('/', protect, getFavorites);
router.get('/check/:movieId', protect, movieIdParamValidator, validate, checkFavorite);
router.delete('/:movieId', protect, movieIdParamValidator, validate, removeFavorite);

export default router;