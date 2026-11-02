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


const { 
    getPatients, searchNewPatient, invitePatient, getPatientInfo, editPatientDisplayName, createCategory, 
    getCategories,
} = require("../controllers/therapist");

router.post("/get-patients", getPatients);
router.post("/search-new-patient", searchNewPatient); 
router.post("/invite-patient", invitePatient);
router.get("/get-patient-info/:linkId", getPatientInfo);
router.patch("/edit-patient-display-name", editPatientDisplayName);
router.post("/create-category", createCategory);
router.post("/get-categories", getCategories);


const { getPendingTherapistsNumber, getTherapists, editCareLink } = require("../controllers/patient");

router.get("/get-pending-therapists/:patientId", getPendingTherapistsNumber);
router.get("/get-therapists/:patientId", getTherapists);
router.patch("/edit-care-link", editCareLink);

export default router;