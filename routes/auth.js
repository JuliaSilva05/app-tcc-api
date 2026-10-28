import express from "express";

const router = express.Router();

const { register, login, 
    // forgotPassword, resetPassword 
} = require("../controllers/auth");

router.get("/", (req, res) => {
    return res.json({ data: "Hello world from the API", });
});

router.post("/register", register);
router.post("/login", login);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);


const { getPatients, searchNewPatient, invitePatient } = require("../controllers/therapist");

router.post("/get-patients", getPatients);
router.post("/search-new-patient", searchNewPatient); 
router.post("/invite-patient", invitePatient); 

export default router;