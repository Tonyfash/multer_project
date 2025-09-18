const { register, getoneUser } = require('../controller/userController');
const uploads = require('../middleware/multer');

const router = require('express').Router();

router.post('/register', uploads.single('profilePicture'), register);
router.get('/:id', getoneUser);


module.exports = router;