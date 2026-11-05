const { ObjectId, ObjectID } = require("mongodb");
import CareLink from "../models/care-link";
import User from "../models/user";
import Folder from "../models/folder";

export const getPatients = async (req, res) => {
  try {
    const { user_id, search } = req.body;

    const links = await CareLink.find(
      {
        therapist: new ObjectId(user_id),
      },
      {
        therapist: 0, therapistDisplayName: 0,
      },
      {
        sort: { status: 1 }
      }
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

    await new CareLink({
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

export const getPatientInfo = async (req, res) => {
  try {
    console.log(req)
    const { linkId } = req.params;

    console.log(linkId);

    const info = await CareLink.aggregate([
      { $match: { _id: new ObjectId(linkId) } },
      { $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientInfo"
        }
      },
      {
        $unwind: {
          path: "$patientInfo",
          preserveNullAndEmptyArrays: true,
        }
      },
      { $project: {
          name: "$patientInfo.name",
          email: "$patientInfo.email",
          patientDisplayName: 1,
        }
      }
    ]);

    console.log('info', info, info[0])

    return res.json({
      info: info[0],
    });
  } catch (e) {
    console.error(e);
  }
}

export const editPatientDisplayName = async (req, res) => {
  try {
    const { newDisplayName, linkId } = req.body;

    await CareLink.updateOne(
      { _id: new ObjectId(linkId) },
      { patientDisplayName: newDisplayName },
    );

    return res.json({
      ok: true,
    });
  } catch (e) {
    console.error(e);
  }
}

export const createCategory = async (req, res) => {
  try {
    const { therapist, name, kind, itemModel } = req.body;

    await new Folder({
      therapist,
      name,
      kind,
      itemModel,
    }).save();

    return res.json({
      ok: true,
    });
  } catch (e) {
    console.log(e);
  }
}

export const getCategories = async (req, res) => {
  try {
    const { therapist, kind, itemModel, search } = req.body;

    const folders = await Folder.find(
      {
        therapist, kind, itemModel,
      },
      {
        name: 1,
        itemsCount: {
          $size: "$items",
        },
      }
    )

    console.log("folders", folders)

    return res.json({
      folders: folders,
    })
  } catch (e) {
    console.log(e);
  }
}

export const createQuestion = async(req, res) => {
  try {
    const { title, titleAudio, description, image, tips } = req.body;

    console.log(title)
    console.log(titleAudio)
    console.log(description)
    console.log(image)
    console.log(tips)

    res.json({
      ok: true,
    });
  } catch(e) {
    console.log(e);
  }
};