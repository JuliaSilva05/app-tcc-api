import Assignment from "../models/assignment";
import Activity from "../models/activity";
import CareLink from "../models/care-link";
import Question from "../models/question";
const { ObjectId } = require("mongodb");
import { getPutSignedUrl, getGetSignedUrl } from "../helpers/r2";

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

export const getAssignments = async (req, res) => {
  try {
    const { patientId } = req.params;

    console.log(patientId)
    const assignmentsList = await Assignment.aggregate([
      { $match: { patient: new ObjectId(patientId) } },
    
      {
        $lookup: {
          from: "activities",
          localField: "activity",
          foreignField: "_id",
          as: "activityInfo"
        },
      },
      {
        $unwind: {
          path: "$activityInfo",
          preserveNullAndEmptyArrays: true,
        }
      },

      {
        $lookup: {
          from: "carelinks",
          localField: "patient",
          foreignField: "patient",
          as: "carelinksInfo"
        },
      },
      {
        $unwind: {
          path: "$carelinksInfo",
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $project: {
          status: 1,
          activity: 1,
          questionsCount: { $size: "$activityInfo.questions" },
          title: "$activityInfo.title",
          therapistDisplayName: "$carelinksInfo.therapistDisplayName",
          createdAt: 1,
        }
      }
    ])

    return res.json({
      assignments: assignmentsList,
    });
  } catch (e) {
    console.error(e);
  }
}

export const getActivityQuestionsData = async (req, res) => {
  try {
    const { activityId, current } = req.params;
    console.log(activityId, current)
    const getQuestionData = await Activity.aggregate([
      {
        $match: { _id: new ObjectId(activityId) },
      },
      {
        $project: {
          questions: 1,
          question: { "$arrayElemAt": [ "$questions", Number(current) ] },
        },
      },

      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "questionInfo"
        },
      },
      {
        $unwind: {
          path: "$questionInfo",
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $replaceRoot: {
          newRoot: "$questionInfo"
        },
      },

      // {
      //   $project: {
      //     title: 1
      //   }
      // }
    ]);

    const imageUrl = await getGetSignedUrl(getQuestionData[0].imageKey);

    const tipsWithFlag = getQuestionData[0].tips.map((v) => ({...v, visible: false}));

    console.log(tipsWithFlag)

    return res.json({
      data: {
        ...getQuestionData[0],
        tips: tipsWithFlag,
        imageUrl,
      },
    });
  } catch (e) {
    console.error(e);
  }
}

export const doAssignment = async (req, res) => {
  try {
    const {  assignmentId, patientId, audioResponse } = req.body;

    console.log(audioResponse)

    const newAudioExtension = audioResponse.url
      .split("?")[0]
      .split(".")
      .pop()
      .toLowerCase();
    const newAudio = await getPutSignedUrl(patientId, "audio", newAudioExtension);

    const newRecording = {
      audio: {
        key: newAudio.key,
        mimeType: audioResponse.mimeType,
        durationSec: audioResponse.durationSec,
        sizeBytes: audioResponse.sizeBytes,
      },
      recordedAt: Date.now(),
    };

    console.log(newRecording)

    const updatedDo = await Assignment.updateOne(
      { _id: new ObjectId(assignmentId) },
      {
        $set: {
          status: "submitted",
          submittedAt: Date.now(),
        },
        $addToSet: {
          recordings: newRecording,
        },
      }
    );

    return res.json({
      ok: true,
      audioUpload: newAudio,
    })

  } catch (e) {
    console.error(e);
  }
}