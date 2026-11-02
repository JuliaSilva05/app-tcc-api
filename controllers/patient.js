import CareLink from "../models/care-link";
const { ObjectId } = require("mongodb");

export const getPendingTherapistsNumber = async (req, res) => {
  try {
    const { patientId } = req.params;

    const linksCount = await CareLink.countDocuments(
      {
        patient: new ObjectId(patientId),
        status: "pending",
      }
    );

    return res.json({
      therapistsCount: linksCount ?? 0,
    });
  } catch (e) {
    console.error(e);
  }
}

export const getTherapists = async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(patientId)

    const links = await CareLink.aggregate([
      {
        $match: { patient: new ObjectId(patientId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "therapist",
          foreignField: "_id",
          as: "therapistInfo"
        },
      },
      {
        $unwind: {
          path: "$therapistInfo",
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $project: {
          _id: 1, therapist: 1, therapistDisplayName: 1,
          status: 1, createdAt: 1, updatedAt: 1,
          therapistEmail: "$therapistInfo.email",
        }
      },
    ])

    console.log(links)

    return res.json({
      therapists: links,
    });
    
  } catch (e) {
    console.error(e);
  }
}

export const editCareLink = async (req, res) => {
  try {
    const { newStatus, linkId } = req.body;
    console.log(newStatus, linkId)

    await CareLink.updateOne(
      { _id: new ObjectId(linkId) },
      { status: newStatus },
    );

    return res.json({
      ok: true,
    });
  } catch (e) {
    console.error(e);
  }
}