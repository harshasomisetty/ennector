import {useState, useEffect} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  getMint,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
const {SystemProgram, Keypair, SYSVAR_RENT_PUBKEY} = web3;
import idl from "../idl.json";
import getProvider from "../utils/provider";
import sleep from "../utils/sleep";
const programID = new PublicKey(idl.metadata.address);
import {useRouter} from "next/router";
import {NextResponse, NextRequest} from "next/server";
import useSWR from "swr";

const CreateNewProject = () => {
  const {wallet, publicKey, sendTransaction} = useWallet();
  const router = useRouter();

  const [treasuryVal, setTreasuryVal] = useState(0);
  const [treasuryAdd, setTreasuryAdd] = useState("");

  const [name, setName] = useState("name");
  const [description, setDescription] = useState("description");
  const [primalMembers, setPrimalMembers] = useState(1);
  const [startingPrice, setStartingPrice] = useState(1);
  const [initialCashout, setInitialCashout] = useState("10");
  // TODO add check for percentage

  let treasuryAccount,
    coreMint,
    primalMint,
    memberMint = null;

  let treasuryBump,
    coreBump,
    primalBump,
    memberBump = null;

  // const fetcher = (url) => fetch(url).then((res) => res.json());
  // const [shouldFetch, setShouldFetch] = useState(false);
  // const {data} = useSWR(shouldFetch ? null : "/api/movies", fetcher);

  async function testFunction() {
    const provider = await getProvider(wallet, "localhost");
    console.log(provider.connection);

    const program = new Program(idl, programID, provider);
    let breh = "2L2aNkpYoyQXeXwmQYZPRDswSrqnUpV3QYypYw4pMaKd";

    let brehKey = new PublicKey(breh);
    console.log("test");
    console.log(brehKey.toString());
    let bal = await getAccount(
      provider.connection,
      brehKey,
      "confirmed",
      programID
    );
    // let bal = await program.account.treasuryAccount.fetch(brehKey);
    console.log(bal);
    // console.log(treasuryAccount.toString());
  }
  async function createProject(event) {
    event.preventDefault();

    const provider = await getProvider(wallet, "localhost");
    const program = new Program(idl, programID, provider);

    [treasuryAccount, treasuryBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("treasury_account"),
        publicKey.toBuffer(),
        Buffer.from(name),
      ],
      programID
    );

    console.log(treasuryAccount.toString());

    [coreMint, coreBump] = await PublicKey.findProgramAddress(
      [Buffer.from("core_mint"), treasuryAccount.toBuffer()],
      programID
    );

    [primalMint, primalBump] = await PublicKey.findProgramAddress(
      [Buffer.from("primal_mint"), treasuryAccount.toBuffer()],
      programID
    );

    [memberMint, memberBump] = await PublicKey.findProgramAddress(
      [Buffer.from("member_mint"), treasuryAccount.toBuffer()],
      programID
    );

    // Initially thought checking Mongodb for inited projects and checking if exists on chain was the same, but we want to keep solana as single source of truth, and mongodb as easy way to query data, so mongodb gets updated later. Initially, did a check through request codes, but errored when account didn't initally exist, but got added to mongo too early

    let existsBal = await provider.connection.getBalance(treasuryAccount);

    let curUserBal = await provider.connection.getBalance(publicKey);
    if (curUserBal < 10) {
      console.log("please get more sol, currently have ", curUserBal);
    } else {
      console.log("balance is enough");

      if (existsBal == 0) {
        console.log("creating: solana says new");

        const tx = await new Transaction().add(
          program.transaction.initTreasury(
            name,
            primalMembers,
            startingPrice,
            initialCashout,
            {
              accounts: {
                treasuryAccount: treasuryAccount,
                coreMint: coreMint,
                primalMint: primalMint,
                memberMint: memberMint,
                creator: publicKey,
                rent: SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
              },
            }
          )
        );

        const signature = await sendTransaction(tx, provider.connection);
        console.log("sending transaction");
        await provider.connection.confirmTransaction(signature, "processed");

        console.log("sent transaction");
        await sleep(1000);

        let postData = {
          treasuryAccount: treasuryAccount.toString(),
          // treasuryBump: treasuryBump,
          coreMint: coreMint.toString(),
          primalMint: primalMint.toString(),
          memberMint: memberMint.toString(),
          creator: publicKey.toString(),
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
        // TODO create alert for already exists with this name parameter
        console.log("Cannot Create solana says exists");
      }
      let account = await program.account.treasuryAccount.fetch(
        treasuryAccount
      );
      console.log("fetched account data");
      // setPrimalMembers(account.primalMembers);
      setTreasuryAdd(treasuryAccount.toString());
      console.log("inited", treasuryAccount.toString());
      router.push("/explore/" + treasuryAccount.toString());
    }
  }

  return (
    <div className="flex flex-col space-y-10">
      <h2>Start your own Project</h2>

      <div>
        {/* <button className="border-2 rounded m-4 p-2" onClick={testFunction}> */}
        {/*   test function */}
        {/* </button> */}

        <form className="grid grid-cols-2" onSubmit={createProject}>
          <div className="grid grid-cols-2 grid-rows-3 items-center gap-x-4 gap-y-8">
            <label className="form-text">Name</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="form-text">Description</label>
            <input
              className="form-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label className="form-text">Number of primal members:</label>
            <input
              type="text"
              className="form-input"
              value={primalMembers}
              onChange={(e) => setPrimalMembers(e.target.value)}
            />
            <label className="form-text">Starting coin price</label>
            <input
              type="text"
              className="form-input"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
            <label className="form-text">Initial Cashout Percent</label>
            <input
              type="text"
              className="form-input"
              value={initialCashout}
              onChange={(e) => setInitialCashout(e.target.value)}
            />
          </div>

          <div className="place-self-center">
            {" "}
            <button
              type="submit"
              className="px-6 py-4 bg-purple-800 m-2 rounded-md text-xl"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
      {/* <div> */}
      {/*   <p>Current fund address: {treasuryAdd}</p> */}
      {/*   <p>Current fund value: {treasuryVal}</p> */}
      {/*   <p>Primal Members: {primalMembers}</p> */}
      {/* </div> */}
    </div>
  );
};

export default CreateNewProject;
