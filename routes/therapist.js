import express from "express";

const router = express.Router();

const { getPatients } = require("../controllers/therapist")

router.get("/get-patients", getPatients);

export default router;