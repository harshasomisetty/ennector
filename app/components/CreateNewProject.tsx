import {useState, useEffect} from "react";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";

import {Connection, PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {Program, Provider, web3} from "@project-serum/anchor";
const {SystemProgram, Keypair} = web3;
const anchor = require("@project-serum/anchor");
import idl from "../idl.json";
import getProvider from "../utils/provider";
const programID = new PublicKey(idl.metadata.address);

const CreateNewProject = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const [treasuryVal, setTreasuryVal] = useState(0);
  const [treasuryAdd, setTreasuryAdd] = useState("");
  const [coreMembers, setCoreMembers] = useState(0);
  const wallet = useWallet();

  let creatorTreasury,
    accountBump = null;
  // const creator = anchor.web3.Keypair.generate();
  const creator = Keypair.fromSecretKey(
    Uint8Array.from([
      15, 104, 79, 168, 175, 65, 89, 45, 57, 35, 16, 132, 191, 233, 136, 150,
      55, 184, 120, 172, 119, 66, 132, 79, 21, 43, 6, 208, 67, 123, 0, 221, 99,
      219, 196, 53, 45, 247, 34, 179, 155, 18, 202, 71, 105, 171, 34, 245, 157,
      226, 232, 30, 128, 139, 217, 152, 212, 124, 42, 108, 241, 56, 197, 137,
    ])
  );
  async function getAirdrop() {
    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    let airdropVal = 20 * LAMPORTS_PER_SOL;

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(publicKey, airdropVal),
      "confirmed"
    );
  }

  async function startProject() {
    console.log("creator pub", creator.publicKey.toString());
    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    let chosenCoreMembers = 190;

    let airdropVal = 20 * LAMPORTS_PER_SOL;
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, airdropVal),
      "confirmed"
    );

    // [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
    //   [Buffer.from("treasury_account"), publicKey.toBuffer()],
    //   programID
    // );

    [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
      [Buffer.from("treasury_account"), creator.publicKey.toBuffer()],
      programID
    );

    let account;
    console.log("pda ", creatorTreasury.toString());
    console.log("pda2 ", creatorTreasury.toBase58());
    // console.log("cur account ", publicKey.toBase58());

    let exists;
    try {
      console.log("checking if exists");
      exists = await program.account.treasuryAccount.fetch(creatorTreasury);
      console.log(exists);
    } catch (err) {
      console.log("not exists? ", err);
    }

    if (exists) {
      console.log("exists");
      account = await program.account.treasuryAccount.fetch(creatorTreasury);
    } else {
      console.log("creating new");

      const tx = await program.rpc.initTreasury(chosenCoreMembers, {
        accounts: {
          treasuryAccount: creatorTreasury,
          user: creator.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [creator],
      });

      // const tx = await program.transaction.initTreasury(chosenCoreMembers, {
      //   accounts: {
      //     treasuryAccount: creatorTreasury,
      //     user: publicKey,
      //     systemProgram: SystemProgram.programId,
      //   },
      // });
      // const signature = await sendTransaction(tx, connection);

      console.log("sent");
      account = await program.account.treasuryAccount.fetch(creatorTreasury);
    }

    setCoreMembers(account.coreMembers);
    setTreasuryAdd(creatorTreasury.toString());
  }
  return (
    <div>
      <p>Start a project</p>
      <button className="border p-2 m-2 rounded" onClick={startProject}>
        Initialize a fun
      </button>

      <button className="border p-2 m-2 rounded" onClick={getAirdrop}>
        Get Airdrop
      </button>

      <p>Current fund address: {treasuryAdd}</p>
      <p>Current fund value: {treasuryVal}</p>

      <p>Core Members: {coreMembers}</p>
    </div>
  );
};

export default CreateNewProject;
