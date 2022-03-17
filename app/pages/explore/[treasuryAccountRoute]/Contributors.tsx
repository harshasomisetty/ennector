import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import {useWallet} from "@solana/wallet-adapter-react";
import {Program, Provider, web3} from "@project-serum/anchor";
const {SystemProgram} = web3;
import * as anchor from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  getMint,
  getProgramAccounts,
  getAccount,
} from "@solana/spl-token";
import {PublicKey, LAMPORTS_PER_SOL, Transaction} from "@solana/web3.js";
import getProvider from "../../../utils/provider";
import idl from "../../../idl.json";
import sleep from "../../../utils/sleep";

const programID = new PublicKey(idl.metadata.address);

const Contributors = () => {
  const router = useRouter();
  const [contributors, setContributors] = useState([]);
  let {treasuryAccountRoute} = router.query;
  const {wallet, publicKey, sendTransaction} = useWallet();
  let treasuryAccount, coreMint;

  let coreBump;

  const [render, setRender] = useState(false);
  useEffect(() => {
    async function bruh() {
      const provider = await getProvider(wallet);
      const program = new Program(idl, programID, provider);

      treasuryAccount = new PublicKey(treasuryAccountRoute);
      console.log(treasuryAccount.toString());

      [coreMint, coreBump] = await PublicKey.findProgramAddress(
        [Buffer.from("core_mint"), treasuryAccount.toBuffer()],
        programID
      );

      const accounts = await provider.connection.getProgramAccounts(
        TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        {
          dataSlice: {
            offset: 0, // number of bytes
            length: 0, // number of bytes
          },
          filters: [
            {
              dataSize: 165, // number of bytes
            },
            {
              memcmp: {
                offset: 0, // number of bytes
                bytes: coreMint.toString(),
              },
            },
          ],
        }
      );
      setContributors(accounts);
    }
    bruh();
  }, []);
  return (
    <div>
      {contributors.length > 0 ? (
        <>
          <h3 className="text-xl">
            these ppl donated to {treasuryAccountRoute}
          </h3>
          <div className="mt-4">
            {" "}
            {contributors.map((account) => (
              <p>{account.pubkey.toString()}</p>
            ))}
          </div>
        </>
      ) : (
        <>
          <p>No one donated yet!</p>
        </>
      )}

      {/* <button */}
      {/*   className="border rounded p-2 m-4" */}
      {/*   onClick={() => setRender(!render)} */}
      {/* > */}
      {/* render */}
      {/* </button> */}
    </div>
  );
};

export default Contributors;
