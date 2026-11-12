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
    getCategories, createQuestion, getQuestions, createActivityAndAssignment, getActivities, 
    getQuestionPreview,
} = require("../controllers/therapist");

router.post("/get-patients", getPatients);
router.post("/search-new-patient", searchNewPatient); 
router.post("/invite-patient", invitePatient);
router.get("/get-patient-info/:linkId", getPatientInfo);
router.patch("/edit-patient-display-name", editPatientDisplayName);
router.post("/create-category", createCategory);
router.post("/get-categories", getCategories);
router.post("/create-question", createQuestion);
router.get("/get-questions/:therapistId", getQuestions);
router.post("/create-activity-and-assignments", createActivityAndAssignment);
router.get("/get-activities/:therapistId", getActivities)
router.get("/get-question-preview/:questionId", getQuestionPreview);



const { 
    getPendingTherapistsNumber, getTherapists, editCareLink, getAssignments, getActivityQuestionsData,
    doAssignment,
} = require("../controllers/patient");

router.get("/get-pending-therapists/:patientId", getPendingTherapistsNumber);
router.get("/get-therapists/:patientId", getTherapists);
router.patch("/edit-care-link", editCareLink);
router.get("/get-assignments/:patientId", getAssignments);
router.get("/get-activity-questions-data/:activityId/:current", getActivityQuestionsData);
router.patch("/do-assignment", doAssignment);


export default router;