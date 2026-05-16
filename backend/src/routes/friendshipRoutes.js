const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/request/:userId', friendshipController.sendRequest);
router.put('/accept/:friendshipId', friendshipController.acceptRequest);
router.delete('/:friendshipId', friendshipController.removeFriendship);
router.get('/friends', friendshipController.getFriends);
router.get('/pending', friendshipController.getPendingRequests);

module.exports = router;
