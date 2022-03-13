import React from "react";
import Link from "next/link";

interface Props {
  name: string;
  link: string;
}

const LinkButton = ({name, link}: Props) => (
  <div className="border-2 rounded-md px-4 py-2 cursor-pointer">
    <Link href={link}>
      <p>{name}</p>
    </Link>
  </div>
);

export default LinkButton;
