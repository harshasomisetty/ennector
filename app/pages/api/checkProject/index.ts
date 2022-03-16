import {connectToDatabase} from "../../../utils/mongodb.ts";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send({message: "Only POST requests allowed"});
    return;
  } else {
    const body = req.body;

    const {db} = await connectToDatabase();

    const checkExists = await db
      .collection("createdProjects")
      .countDocuments({treasuryKey: body["treasuryKey"]}, {limit: 1});

    if (checkExists == 1) {
      res.status(406).json({
        message: "Treasury account already exists, please use a different name",
      });
    } else {
      const projs = await db.collection("createdProjects").insertOne(body);
      res.status(200).json({message: "Treasury account successfully created"});
    }

    return;
  }
}
