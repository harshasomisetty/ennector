import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {Program, Provider, web3} from "@project-serum/anchor";
import {Connection, PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import getProvider from "../utils/provider";
import idl from "../idl.json";
const programID = new PublicKey(idl.metadata.address);

const Airdrop = ({pubkey}) => {
  const {wallet, publicKey} = useWallet();
  async function getAirdrop(pubkey) {
    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    let airdropVal = 20 * LAMPORTS_PER_SOL;

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(publicKey, airdropVal),
      "confirmed"
    );

    console.log("got airdrop");
  }

  return (
    <button
      className="border p-2 m-2 rounded"
      onClick={() => getAirdrop(pubkey)}
    >
      Get Airdrop
    </button>
  );
};

export default Airdrop;
