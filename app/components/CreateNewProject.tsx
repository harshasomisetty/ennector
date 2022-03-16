import {useState, useEffect} from "react";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {Connection, PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";
const {SystemProgram, Keypair} = web3;
import idl from "../idl.json";
import getProvider from "../utils/provider";
import sleep from "../utils/sleep";
const programID = new PublicKey(idl.metadata.address);
import {useRouter} from "next/router";
import {NextResponse, NextRequest} from "next/server";
import useSWR from "swr";

const CreateNewProject = () => {
  // const {connection} = useConnection();
  const connection = new Connection("http://localhost:8899");
  const {wallet, publicKey, sendTransaction} = useWallet();
  const router = useRouter();

  const [treasuryVal, setTreasuryVal] = useState(0);
  const [treasuryAdd, setTreasuryAdd] = useState("");

  const [name, setName] = useState("name");
  const [description, setDescription] = useState("description");
  const [coreMembers, setCoreMembers] = useState(1);
  const [startingPrice, setStartingPrice] = useState(1);

  let creatorTreasury,
    accountBump = null;

  // const fetcher = (url) => fetch(url).then((res) => res.json());
  // const [shouldFetch, setShouldFetch] = useState(false);
  // const {data} = useSWR(shouldFetch ? null : "/api/movies", fetcher);

  async function createProject(event) {
    event.preventDefault();

    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("treasury_account"),
        publicKey.toBuffer(),
        Buffer.from(name),
      ],
      programID
    );

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
          coreMembers,
          name,
          startingPrice,
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
        let postData = {
          walletKey: publicKey.toString(),
          treasuryKey: creatorTreasury,
          name: name,
          description: description,
        };
        const data = await fetch("/api/checkProject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        // setShouldFetch(true);
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

      router.push("/explore/" + creatorTreasury.toString());
    }
  }

  return (
    <div className="flex flex-col space-y-10">
      <p>Start a project</p>
      <div>
        <form className="flex flex-col" onSubmit={createProject}>
          <label>
            Name:
            <input
              className="text-red-700"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Description:
            <input
              className="text-red-700"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label>
            Number of core members:
            <input
              type="text"
              className="text-red-700"
              value={coreMembers}
              onChange={(e) => setCoreMembers(e.target.value)}
            />
          </label>
          <label>
            Starting coin price:
            <input
              type="text"
              className="text-red-700"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
          </label>
          <button type="submit" className="border p-2 m-2 rounded">
            Create Fund
          </button>
        </form>
      </div>
      {/* <div> */}
      {/*   <p>Current fund address: {treasuryAdd}</p> */}
      {/*   <p>Current fund value: {treasuryVal}</p> */}
      {/*   <p>Core Members: {coreMembers}</p> */}
      {/* </div> */}
    </div>
  );
};

export default CreateNewProject;
