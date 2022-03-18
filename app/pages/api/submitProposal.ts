import {connectToDatabase} from "../../utils/mongodb.ts";

export default async function handler(req, res) {
  const body = req.body;

  const {db} = await connectToDatabase();

  let myquery = {treasuryAccount: body["treasuryAccount"]};
  const allProjects = await db.collection("createdProjects").findOne(myquery);

  if (Object.keys(allProjects).includes("proposals")) {
    allProjects["proposals"].push([body["sender"], body["proposal"]]);
  } else {
    allProjects["proposals"] = [[body["sender"], body["proposal"]]];
  }

  db.collection("createdProjects").deleteOne(myquery);
  db.collection("createdProjects").insertOne(allProjects);

  res.status(200).json({message: "submitted proposal"});
}
