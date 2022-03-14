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

const CreateNewProject = () => {
  // const {connection} = useConnection();
  const connection = new Connection("http://localhost:8899");
  const {publicKey, sendTransaction} = useWallet();
  const [treasuryVal, setTreasuryVal] = useState(0);
  const [treasuryAdd, setTreasuryAdd] = useState("");
  const [coreMembers, setCoreMembers] = useState(0);
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

  async function checkBal(atleastValue = 10) {
    const provider = await getProvider(wallet);
    let curUserBal = await connection.getBalance(publicKey);
    console.log(atleastValue);
    console.log(curUserBal);
  }
  async function startProject() {
    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    let chosenCoreMembers = 190;

    [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
      [Buffer.from("treasury_account"), publicKey.toBuffer()],
      programID
    );

    let exists;
    try {
      console.log("checking if exists");
      exists = await program.account.treasuryAccount.fetch(creatorTreasury);
    } catch (err) {}

    let curUserBal = await connection.getBalance(publicKey);
    if (curUserBal < 10) {
      console.log("please get more sol, currently have ", curUserBal);
    } else {
      if (!exists) {
        console.log("creating new");

        const tx = await program.transaction.initTreasury(chosenCoreMembers, {
          accounts: {
            treasuryAccount: creatorTreasury,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          },
        });

        const signature = await sendTransaction(tx, connection);
        console.log("sent");
        await sleep(1000);
      } else {
        console.log("exists");
      }
      let account = await program.account.treasuryAccount.fetch(
        creatorTreasury
      );

      setCoreMembers(account.coreMembers);
      setTreasuryAdd(creatorTreasury.toString());
    }
  }

  async function transferFunds() {}

  return (
    <div>
      <p>Start a project</p>
      <button className="border p-2 m-2 rounded" onClick={startProject}>
        Initialize a fun
      </button>

      <button className="border p-2 m-2 rounded" onClick={getAirdrop}>
        Get Airdrop
      </button>

      <button className="border p-2 m-2 rounded" onClick={() => checkBal()}>
        check bal
      </button>

      <p>Current fund address: {treasuryAdd}</p>
      <p>Current fund value: {treasuryVal}</p>

      <p>Core Members: {coreMembers}</p>
    </div>
  );
};

export default CreateNewProject;
