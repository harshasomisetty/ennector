import {useState, useEffect} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import {Program, Provider, web3} from "@project-serum/anchor";
const {SystemProgram} = web3;
import * as anchor from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  getMint,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import {PublicKey, LAMPORTS_PER_SOL, Transaction} from "@solana/web3.js";
import getProvider from "../utils/provider";
import idl from "../idl.json";
import sleep from "../utils/sleep";
import ProjectList from "./ProjectList";
const programID = new PublicKey(idl.metadata.address);

const InvestedProjects = () => {
  const [investedProjs, setInvestedProjs] = useState([]);
  const [render, setRender] = useState(false);

  const {wallet, publicKey, sendTransaction} = useWallet();

  useEffect(() => {
    async function getInvestedAccounts() {
      const provider = await getProvider(wallet);
      const program = new Program(idl, programID, provider);

      let allAssAdd = [];

      let response = await fetch("api/findProjects");
      let data = await response.json();

      let coreMint, element, assAdd, balance;

      for (let i = 0; i < data.length; i++) {
        element = data[i];
        coreMint = new PublicKey(element["coreMint"]);
        assAdd = await getAssociatedTokenAddress(
          coreMint,
          publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        balance = await provider.connection.getBalance(assAdd);

        if (Number(balance) > 0) {
          allAssAdd.push(element);
        }
      }
      setInvestedProjs(allAssAdd);
    }
    getInvestedAccounts();
  });

  return (
    <div>
      <p>Your Invested Projects</p>
      {investedProjs.length > 0 ? (
        <ProjectList projects={investedProjs} />
      ) : (
        <p>You haven't invested in any projects yet! </p>
      )}
    </div>
  );
};

export default InvestedProjects;
