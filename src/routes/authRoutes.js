const express = require('express');
const { createUser, handleLogin, getUser,
    getAccount,
    registerEvent
} = require('../controllers/userController');


const router = express.Router();
router.post("/register", createUser);
router.post("/login", handleLogin);

router.get("/user", getUser);
router.get("/account", getAccount);
router.patch("/user/register/:id", registerEvent);

module.exports = router;
