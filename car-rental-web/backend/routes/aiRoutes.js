const express = require('express');
const { chatWithAI, getChatHistory } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/chat', protect, chatWithAI);
router.get('/history', protect, getChatHistory);

module.exports = router;
