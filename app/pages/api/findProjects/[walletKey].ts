import {connectToDatabase} from "../../../utils/mongodb.ts";
import {useRouter} from "next/router";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send({message: "Only GET requests allowed"});
    return;
  } else {
    const {walletKey} = req.query;

    const {db} = await connectToDatabase();

    const allProjects = await db
      .collection("createdProjects")
      .find({walletKey: walletKey});

    let data = [];
    await allProjects.forEach(function (project) {
      data.push(project);
    });

    console.log(data);
    res.status(200).json(data);

    return;
  }
}
