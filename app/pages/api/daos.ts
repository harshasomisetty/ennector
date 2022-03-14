import {connectToDatabase} from "../../utils/mongodb.ts";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send({message: "Only POST requests allowed"});
    return;
  } else {
    const body = req.body;
    // console.log(body);

    console.log(body["name"]);
    const {db} = await connectToDatabase();

    const projs = await db.collection("createdProjects").insertOne(body);

    res.status(200).send("gosdjfl");
    // console.log(projs);
    // res.json(projs);

    return;
  }

  res.json(body);
}
