const { ObjectId, ObjectID } = require("mongodb");
import CareLink from "../models/care-link";
import User from "../models/user";
import Folder from "../models/folder";
import Question from "../models/question";
import Activity from "../models/activity";
import Assignment from "../models/assignment";
import { getPutSignedUrl, getGetSignedUrl } from "../helpers/r2";


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
          patientId: "$patient",
          therapistId: "$therapist",
          name: "$patientInfo.name",
          email: "$patientInfo.email",
          patientDisplayName: 1,
        }
      }
    ]);

    const history = await Assignment.aggregate([
      { 
        $match: { 
          patient: new ObjectId(info[0].patientId),
          therapist: new ObjectId(info[0].therapistId),
        } 
      },
      { $lookup: {
          from: "activities",
          localField: "activity",
          foreignField: "_id",
          as: "activityInfo"
        }
      },
      {
        $unwind: {
          path: "$activityInfo",
          preserveNullAndEmptyArrays: true,
        }
      },
      { $project: {
          title: "$activityInfo.title",
          status: 1,
          recordings: 1,
        }
      }
    ]);

    console.log('info', info, info[0])
    console.log('history', history)

    return res.json({
      info: info[0],
      history: history,
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
    const { therapist, title, descriptionAudio, description, image, tips } = req.body;

    console.log(therapist)
    console.log(title)
    console.log(descriptionAudio)
    console.log(description)
    console.log(image)
    console.log(tips)

    const imageUpload = await getPutSignedUrl(therapist, "image", image.split(".").pop());

    let descriptionAudioUpload;
    if (descriptionAudio) {
      descriptionAudioUpload = await getPutSignedUrl(therapist, "audio", descriptionAudio.mimeType);
    }

    const formattedTips = [];
    const tipsUploads = [];
    
    for (const tip of tips) {
      if (tip.audio) {
        try {
          const tipUpload = await getPutSignedUrl(therapist, "audio", (tip.audio.url).split(".").pop());
            
          formattedTips.push({
            text: tip.text,
            audio: {
              key: tipUpload.key,
              mimeType: tip.audio.mimeType,
              durationSec: tip.audio.durationSec,
              sizeBytes: tip.audio.sizeBytes,
            },
          })
          tipsUploads.push({
            id: tip.id,
            upload: tipUpload,
          });
        } catch (e) {
          console.log(e);
        }
      } else {
        formattedTips.push(tip);
      }
    }

    const newQuestion = await new Question({
      therapist,
      title,
      ...(descriptionAudioUpload ?
        { 
          descriptionAudio: {
            key: descriptionAudioUpload.key,
            mimeType: descriptionAudio.mimeType,
            durationSec: descriptionAudio.durationSec,
            sizeBytes: descriptionAudio.sizeBytes,
          }
        } : {}
      ),
      description,
      imageKey: imageUpload.key,
      tips: formattedTips,
    }).save();

    res.json({
      ok: true,
      questionId: newQuestion._id,
      uploads: {
        imageUpload: imageUpload,
        descriptionAudioUpload: descriptionAudioUpload,
        tipsUploads: tipsUploads,
      },
    });
  } catch(e) {
    console.log(e);
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { therapistId } = req.params;

    console.log(therapistId)

    const questions = await Question.find(
      {
        therapist: new ObjectId(therapistId),
      },
      {
        title: 1, description: 1, tips: 1,
        imageKey: 1,
      }
    ).lean();
    
    console.log("questions", questions)
    
    const questionsWithImages = await Promise.all(
      questions.map(async ({ imageKey, ...question }) => ({
        ...question,
        image: imageKey
          ? {
              url:  await getGetSignedUrl(imageKey),
              contentType: `image/${imageKey.split(".").pop()}`
            }
          : null,
      }))
    );
    
    console.log("questionsWithImages", questionsWithImages)

    return res.json({
      questions: questionsWithImages,
    })
  } catch (e) {
    console.log(e);
  }
}

export const getQuestionPreview = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findOne(
      {
        _id: new ObjectId(questionId),
      },
      {
        title: 1, description: 1, tips: 1,
        imageKey: 1,
      }
    ).lean();
    
    console.log("questions", question)

    const imageUrl = await getGetSignedUrl(question.imageKey);
    
    const tipsWithFlag = question.tips.map((v) => ({...v, visible: false}));
    

    return res.json({
      data: {
        ...question,
        tips: tipsWithFlag,
        imageUrl,
      },
    })
  } catch (e) {
    console.log(e);
  }
}

export const createActivityAndAssignment = async (req, res) => {
  try {
    const { therapist, title, questions, patients } = req.body;

    console.log(therapist, title, questions, patients)

    const newActivity = await new Activity({
      therapist,
      title,
      questions: questions.map(v => new ObjectId(v)),
    }).save();

    console.log('newActivity',newActivity)

    let newAssignments = [];
    if (patients && patients.length) {
      patients.forEach(async (v) => {
        const newAssignment = await new Assignment({
          activity: newActivity._id,
          therapist,
          patient: new ObjectId(v),
        }).save();

        newAssignments.push(newAssignment);
      })

    }
    console.log('newAssignments',newAssignments)

    return res.json({
      ok: true,
    })
  } catch (e) {
    console.log(e);
  }
}

export const getActivities = async (req, res) => {
  try {
    const { therapistId } = req.params;


  const activities = await Activity.aggregate([
    {
      $match: {
        therapist: new ObjectId(therapistId)
      }
    },

    // 1. Get questions with _id and title
    {
      $lookup: {
        from: "questions",
        localField: "questions",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1
            }
          }
        ],
        as: "questionsInfo"
      }
    },

    // 2. Find assignments for each activity
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "activity",
        pipeline: [

          // 3. Find the corresponding carelink
          {
            $lookup: {
              from: "carelinks",
              let: {
                patientId: "$patient",
                therapistId: "$therapist"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$patient", "$$patientId"]
                        },
                        {
                          $eq: ["$therapist", "$$therapistId"]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    patientDisplayName: 1
                  }
                }
              ],
              as: "carelinkInfo"
            }
          },

          // Extract patientDisplayName from carelinkInfo
          {
            $project: {
              _id: "$patient",
              patientDisplayName: {
                $ifNull: [
                  {
                    $arrayElemAt: [
                      "$carelinkInfo.patientDisplayName",
                      0
                    ]
                  },
                  null
                ]
              }
            }
          }
        ],
        as: "assignmentInfo"
      }
    },

    // 4. Return the final structure
    {
      $project: {
        _id: 1,
        title: 1,
        questions: "$questionsInfo",
        patients: "$assignmentInfo"
      }
    }
  ]);


    // const activities = await Activity.aggregate([
    //   {
    //     $match: { 
    //       therapist: new ObjectId(therapistId) 
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "questions",
    //       let: { arrayField: "$questions" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: { $in: ["$_id", "$$arrayField"] }
    //           }
    //         },
    //         {
    //           $project: {
    //             title: 1,
    //           }
    //         }
    //       ],
    //       as: "questionsInfo",
    //     },
    //   },

    //   {
    //     $lookup: {
    //       from: "assignments",
    //       let: { act_id: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: { $eq: ["$activity", "$$act_id"] }
    //           }
    //         },
            
    //         { $lookup: {
    //             from: "users",
    //             localField: "patient",
    //             foreignField: "_id",
    //             as: "patientInfo"
    //           }
    //         },
    //         {
    //           $unwind: {
    //             path: "$patientInfo",
    //             preserveNullAndEmptyArrays: true,
    //           }
    //         },
    //         { $lookup: {
    //             from: "carelinks",
    //             let: { thera_id: therapistId },
    //             // localField: "$patientInfo._id",
    //             // foreignField: "_id",
    //             pipeline: [
    //               {
    //                 $match: {
    //                   $expr: {
    //                     $and: [
    //                       { $eq: ["$patient", "$patientInfo._id"] },
    //                       { $eq: ["$therapist", "$$thera_id"] },
    //                     ],
    //                   } ,
    //                 },
    //               },
    //               {
    //                 $project: {
    //                   patientDisplayName: 1,
    //                 }
    //               }
    //             ],
    //             as: "patientInfo2"
    //           }
    //         },
    //         {
    //           $unwind: {
    //             path: "$patientInfo2",
    //             preserveNullAndEmptyArrays: true,
    //           }
    //         },

    //         {
    //           $project: {
    //             patientTest: "$patientInfo2",
    //             patientDisplayName: "$patientInfo2.patientDisplayName",
    //           }
    //         }
            
    //       ],
    //       as: "assignmentInfo",
    //     },
    //   },

    //   {
    //     $unwind: {
    //       path: "$assignmentInfo",
    //       preserveNullAndEmptyArrays: true,
    //     }
    //   },

    //   {
    //     $project: {
    //       title: 1, 
    //       questions: "$questionsInfo",
    //       patients: "$assignmentInfo",
    //     },
    //   }
    // ]);

    console.log(activities)
    console.log(activities.patients)

    return res.json({
      activities: activities.flat(),
    })
  } catch (e) {
    console.log(e);
  }
}