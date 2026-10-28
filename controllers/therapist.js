const { ObjectId, ObjectID } = require("mongodb");
import CareLink from "../models/care-link";
import User from "../models/user";

export const getPatients = async (req, res) => {
  try {
    const { user_id, search, status } = req.body;

    console.log(user_id, status)
    const links = await CareLink.find(
      {
        therapist: new ObjectId(user_id),
        status: status,
      },
      // {
      //   _id: 1, patientDisplayName: 1,
      // }
    );

    console.log("links", links)

    return res.json({
      patients: links,
    })
    
  } catch (e) {
    console.error(e);
  }
}

export const searchNewPatient = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = email.toLowerCase();

    const patient = await User.findOne(
      {
        email: normalizedEmail,
        role: "patient",
      },
      {
        _id: 1, name: 1, email: 1,
      },
    );

    console.log(normalizedEmail, patient)

    if (!patient) {
      return res.json({
        title: "Usuário não encontrado",
        message: "Revise o endereço de e-mail ou envie um convite para esse e-mail",
      });
    }

    return res.json({
      title: "Usuário encontrado",
      message: "Confirme os dados e envie um pedido de contato",
      patient,
    });

  } catch(e) {
    console.error(e);
  }
}

export const invitePatient = async (req, res) => {
  try {
    const { patient, therapist } = req.body;
    console.log(patient, therapist);

    const patientId = new ObjectId(patient._id);
    const therapistId = new ObjectId(therapist._id);

    const exists = await CareLink.findOne({
      patient: patientId,
      therapist: therapistId,
    });
    console.log(exists)
    if (exists) {
      return res.json({ ok: false });
    }

    const newCareLink = await new CareLink({
      patient: patientId,
      therapist: therapistId,
      patientDisplayName: patient.name,
      therapistDisplayName: therapist.name,
      status: "pending",
    }).save();

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
  }
}