import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {Program, Provider, web3} from "@project-serum/anchor";
import {Connection, PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import getProvider from "../../utils/provider";
import idl from "../../idl.json";
const programID = new PublicKey(idl.metadata.address);

const ExploreTreasury = () => {
  const [coreMembers, setCoreMembers] = useState();
  const router = useRouter();

  const {treasuryKey} = router.query;
  const connection = new Connection("http://localhost:8899");

  const wallet = useWallet();

  useEffect(() => {
    if (!router.isReady) return;
    else {
      async function findTreasury() {
        console.log(treasuryKey);
        let response = await fetch(
          "http://localhost:3000/api/checkProject/" + treasuryKey
        );
        let data = await response.json();
        console.log(data);

        const provider = await getProvider(wallet);
        const program = new Program(idl, programID, provider);

        let newPublic = new PublicKey(data["walletKey"]);
        let [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
          [
            Buffer.from("treasury_account"),
            newPublic.toBuffer(),
            Buffer.from(data["name"]),
          ],
          programID
        );

        let accountInfo = await program.account.treasuryAccount.fetch(
          creatorTreasury
        );
        setCoreMembers(accountInfo.coreMembers);
      }
      findTreasury();
    }
  }, [router.isReady]);
  if (!coreMembers) {
    return <p>Loading</p>;
  } else {
    return (
      <div>
        {" "}
        <p>Treasury: {treasuryKey}</p>
        <p>CoreMembers: {coreMembers}</p>
      </div>
    );
  }
};

export default ExploreTreasury;
