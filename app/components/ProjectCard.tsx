import React from "react";
import Link from "next/link";

const ProjectCard = ({project}) => (
  <Link href={"/explore/" + project["treasuryAccount"]}>
    <div className="flex flex-col items-center border bg-gray-800 bg-opacity-50 hover:bg-opacity-100 rounded-md m-2 p-2 truncate overflow-hidden w-40 ">
      <div className="flex bg-gray-700 text-3xl justify-center border rounded-full h-12 w-12">
        {project["name"].slice(0, 1)}
      </div>
      <p className="text-2xl">{project["name"]}</p>
      <p className="text-xl w-32">{project["description"]}</p>
      <p className="w-32">Treasury: {project["treasuryAccount"]}</p>
    </div>
  </Link>
);

export default ProjectCard;
