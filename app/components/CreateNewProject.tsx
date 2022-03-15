import {useState, useEffect} from "react";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {Connection, PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";
const {SystemProgram, Keypair} = web3;
const anchor = require("@project-serum/anchor");
import idl from "../idl.json";
import getProvider from "../utils/provider";
import sleep from "../utils/sleep";
const programID = new PublicKey(idl.metadata.address);

import {useRouter} from "next/router";
import useSWR from "swr";

const CreateNewProject = () => {
  // const {connection} = useConnection();
  const connection = new Connection("http://localhost:8899");
  const {publicKey, sendTransaction} = useWallet();
  const [treasuryVal, setTreasuryVal] = useState(0);
  const [treasuryAdd, setTreasuryAdd] = useState("");
  const [coreMembers, setCoreMembers] = useState(0);

  const [formName, setName] = useState("name");
  const [formDescription, setDescription] = useState("description");
  const [formMembers, setMembers] = useState(1);
  const [formPrice, setPrice] = useState(2);
  const wallet = useWallet();

  let creatorTreasury,
    accountBump = null;

  async function getAirdrop() {
    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    let airdropVal = 20 * LAMPORTS_PER_SOL;

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(publicKey, airdropVal),
      "confirmed"
    );

    console.log("got airdrop");
  }

  async function transferFunds() {}

  // const fetcher = (url) => fetch(url).then((res) => res.json());
  // const [shouldFetch, setShouldFetch] = useState(false);
  // const {data} = useSWR(shouldFetch ? null : "/api/movies", fetcher);

  async function handleSubmit(event) {
    event.preventDefault();

    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("treasury_account"),
        publicKey.toBuffer(),
        Buffer.from(formName),
      ],
      programID
    );

    let b = {
      walletKey: publicKey.toString(),
      treasuryKey: creatorTreasury,
      name: formName,
    };

    console.log(creatorTreasury.toString());

    // Initially thought checking Mongodb for inited projects and checking if exists on chain was the same, but we want to keep solana as single source of truth, and mongodb as easy way to query data, so mongodb gets updated later. Initially, did a check through request codes, but errored when account didn't initally exist, but got added to mongo too early

    let exists;
    try {
      console.log("checking if exists");
      exists = await program.account.treasuryAccount.fetch(creatorTreasury);
    } catch (err) {}

    let curUserBal = await connection.getBalance(publicKey);
    if (curUserBal < 10) {
      console.log("please get more sol, currently have ", curUserBal);
    } else {
      console.log("balance is enough");

      if (!exists) {
        console.log("creating: solana says new");

        const tx = await program.transaction.initTreasury(
          formMembers,
          formName,
          {
            accounts: {
              treasuryAccount: creatorTreasury,
              user: publicKey,
              systemProgram: SystemProgram.programId,
            },
          }
        );

        const signature = await sendTransaction(tx, connection);
        console.log("sent transaction");
        await sleep(1000);
        const data = await fetch("/api/checkProject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(b),
        });

        // setShouldFetch(true);
        console.log("got json", data.status);
      } else {
        console.log("solana says exists");
      }
      let account = await program.account.treasuryAccount.fetch(
        creatorTreasury
      );
      console.log("fetched account data");
      setCoreMembers(account.coreMembers);
      setTreasuryAdd(creatorTreasury.toString());
      console.log("inited");
    }
  }

  return (
    <div className="flex flex-col space-y-10">
      <p>Start a project</p>
      <div className="flex flex-row justify-center">
        <button className="border p-2 m-2 rounded" onClick={getAirdrop}>
          Get Airdrop
        </button>
      </div>
      <div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              className="text-red-700"
              type="text"
              value={formName}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Description:
            <input
              className="text-red-700"
              type="text"
              value={formDescription}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Number of core members:
            <input
              type="text"
              className="text-red-700"
              value={formMembers}
              onChange={(e) => setMembers(e.target.value)}
            />
          </label>
          <label>
            Starting coin price:
            <input
              type="text"
              className="text-red-700"
              value={formPrice}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <button type="submit" className="border p-2 m-2 rounded">
            Create Fund
          </button>
        </form>
      </div>
      <div>
        {" "}
        <p>Current fund address: {treasuryAdd}</p>
        <p>Current fund value: {treasuryVal}</p>
        <p>Core Members: {coreMembers}</p>
      </div>
    </div>
  );
};

export default CreateNewProject;
