import React from "react";
import Link from "next/link";

interface Props {
  name: string;
  link: string;
  attributes: string;
}

const LinkButton = ({name, link, attributes}: Props) => (
  <Link href={link}>
    <button className={attributes}>
      <p>{name}</p>
    </button>
  </Link>
);

export default LinkButton;
