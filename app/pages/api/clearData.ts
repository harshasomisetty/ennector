import {connectToDatabase} from "../../utils/mongodb.ts";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send({message: "Only POST requests allowed"});
    return;
  } else {
    const {db} = await connectToDatabase();

    await db.collection("createdProjects").deleteMany({});

    res.status(200).json({message: "Deleted all mongo data"});

    return;
  }
}
