import express from 'express';
import {
  addToHistory,
  getHistory,
  clearHistory,
} from '../controllers/watchHistory.controller.js';

import protect from '../middlewares/auth.middleware.js';

import {
  addToHistoryValidator,
  historyPaginationValidator,
} from '../validators/watchHistory.validator.js';

import validate from '../middlewares/validationMiddleware.js';
const router = express.Router();

router.get('/', protect, historyPaginationValidator, validate, getHistory);
router.post('/', protect, addToHistoryValidator, validate, addToHistory);
router.delete('/', protect, clearHistory);

export default router;