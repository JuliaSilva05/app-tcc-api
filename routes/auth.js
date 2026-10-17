import express from "express";

const router = express.Router();

const { register, login, forgotPassword, resetPassword } = require("../controllers/auth");

router.get("/", (req, res) => {
    return res.json({ data: "Hello world from the API", });
});

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;