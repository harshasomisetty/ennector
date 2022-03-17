import React from "react";
import Link from "next/link";

interface ProjectProps {
  _id: string;
  walletKey: string;
  treasuryAccount: string;
  name: string;
}

const ProjectCard = ({project}) => (
  <Link href={"/explore/" + project["treasuryAccount"]}>
    <div className="flex flex-col items-center border bg-gray-800 bg-opacity-50 hover:bg-opacity-100 rounded-md m-2 p-2 truncate overflow-hidden w-40">
      <div className="flex bg-gray-700 justify-center border rounded-full h-8 w-8">
        {project["name"].slice(0, 1)}
      </div>
      <p>{project["name"]}</p>

      <p className="w-32">wallet: {project["walletKey"]}</p>
      <p className="w-32"> treasury: {project["treasuryAccount"]}</p>
    </div>
  </Link>
);

export default ProjectCard;
