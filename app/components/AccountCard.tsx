import React from "react";
import Link from "next/link";

const AccountCard = ({address}) => {
  console.log("card", address);
  return (
    <>
      <a href={"https://explorer.solana.com/address/" + {address}}>
        <div className="flex flex-col items-center place-content-around border bg-gray-800 bg-opacity-50 hover:bg-opacity-100 rounded-xl m-2 p-2 truncate overflow-hidden w-40 h-48">
          <div className="flex bg-gray-700 text-5xl justify-center border rounded-full h-20 w-20">
            {address.slice(0, 1)}
          </div>
          <p className="overflow-hidden">{address}</p>
        </div>
      </a>
    </>
  );
};

export default AccountCard;
