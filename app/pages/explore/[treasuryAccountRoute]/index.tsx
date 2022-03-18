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
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";
import {PublicKey, LAMPORTS_PER_SOL, Transaction} from "@solana/web3.js";
import getProvider from "../../../utils/provider";
import idl from "../../../idl.json";
import sleep from "../../../utils/sleep";

const programID = new PublicKey(idl.metadata.address);

const ExploreTreasury = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primalMembers, setPrimalMembers] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [initialCashout, setInitialCashout] = useState("0");
  const [preseedStatus, setPreseedStatus] = useState(false);
  const [coreMintAdd, setCoreMintAdd] = useState("");

  const [program, setProgram] = useState();
  const [provider, setProvider] = useState();
  // const [treasuryAccount, setTreasuryAccount] = useState();

  const [treasuryBalance, setTreasuryBalance] = useState(0);
  // const [treasuryBump, setTreasuryBump] = useState(0);
  const [creatorKey, setCreatorKey] = useState("");

  const [transactionValue, setTransactionValue] = useState(1);

  const [rerender, setRerender] = useState(false);

  const [creatorLogged, setCreatorLogged] = useState(true); // replace later

  const router = useRouter();

  const {wallet, publicKey, sendTransaction} = useWallet();
  const {treasuryAccountRoute} = router.query;
  let creatorAccount,
    treasuryAccount,
    coreMint,
    primalMint,
    memberMint = null;

  let treasuryBump,
    coreBump,
    primalBump,
    memberBump = null;

  useEffect(() => {
    if (!router.isReady) return;
    else {
      async function setMetadata() {
        // setProvider(providerObj);
        // setProgram(programObj);
      }
      async function findTreasury() {
        let response = await fetch(
          "http://localhost:3000/api/checkProject/" + treasuryAccountRoute
        );
        const provider = await getProvider(wallet);
        const program = new Program(idl, programID, provider);
        let data = await response.json();
        setCreatorKey(data["creator"]);

        creatorAccount = new PublicKey(data["creator"]);

        [treasuryAccount, treasuryBump] = await PublicKey.findProgramAddress(
          [
            Buffer.from("treasury_account"),
            creatorAccount.toBuffer(),
            Buffer.from(data["name"]),
          ],
          programID
        );

        // setTreasuryAccount(treasuryAccountObj.toString());

        let accountInfo = await program.account.treasuryAccount.fetch(
          treasuryAccount
        );

        setName(data["name"]);

        setDescription(data["description"]);
        setCoreMintAdd(data["coreMint"]);
        setPrimalMembers(accountInfo.primalMembers);
        setStartingPrice(accountInfo.startingPrice);
        setPreseedStatus(accountInfo.preseedStatus);
        // setTreasuryBump(data["treasuryBump"]);

        const treasuryBalFetch = await provider.connection.getBalance(
          treasuryAccount
        );

        setTreasuryBalance(treasuryBalFetch / LAMPORTS_PER_SOL);
      }
      setMetadata();
      findTreasury();
    }
  }, [router.isReady, rerender]);

  async function submitTransaction() {
    event.preventDefault();

    const provider = await getProvider(wallet);
    const program = new Program(idl, programID, provider);

    creatorAccount = new PublicKey(creatorKey);
    [treasuryAccount, treasuryBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("treasury_account"),
        creatorAccount.toBuffer(),
        Buffer.from(name),
      ],
      programID
    );
    const investorBalance = await provider.connection.getBalance(publicKey);

    if (investorBalance / LAMPORTS_PER_SOL < transactionValue) {
      //TODO add alert
      console.log("Account Balance not enough, please add more sol");
    } else {
      let [depositMap, depositBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("deposit_map"),
          treasuryAccount.toBuffer(),
          publicKey.toBuffer(),
        ],
        programID
      );

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

      let coreDepositWallet = await getAssociatedTokenAddress(
        coreMint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const tx = await new Transaction().add(
        program.transaction.depositTreasury(
          treasuryBump,
          new anchor.BN(transactionValue * LAMPORTS_PER_SOL),
          {
            accounts: {
              treasuryAccount: treasuryAccount,
              depositMap: depositMap,
              coreMint: coreMint,
              coreDepositWallet: coreDepositWallet,
              depositor: publicKey,
              creator: creatorAccount,
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
          }
        )
      );

      const signature = await sendTransaction(tx, provider.connection);
      await provider.connection.confirmTransaction(signature, "processed");

      await sleep(1000);
      setRerender(!rerender);
    }

    // setShowModal(false);
  }

  if (!primalMembers) {
    return <p>Loading</p>;
  } else {
    return (
      <>
        <div className="flex flex-row justify-around text-center">
          <div className="border">
            <p>Name: {name}</p>
            <p>Description: {description}</p>
            <p>Creator: {creatorKey}</p>
            <p>Treasury: {treasuryAccountRoute}</p>
            <p>Core Mint add: {coreMintAdd}</p>
            <p>PrimalMembers: {primalMembers}</p>
            <p>Starting Price: {startingPrice}</p>
            <p>Treasury Balance: {treasuryBalance} </p>
          </div>

          <div>
            {publicKey ? (
              <div>
                {publicKey.toString() === creatorKey ? (
                  <>
                    <>
                      <p>You Created this Project! </p>
                      <div className="flex flex-col">
                        {preseedStatus ? (
                          <button className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300 m-4">
                            Close Preseed
                          </button>
                        ) : (
                          <button className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300 m-4">
                            Raise Fund
                          </button>
                        )}
                        <button
                          className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300 m-4"
                          onClick={() =>
                            router.push(
                              "/explore/" +
                                treasuryAccountRoute +
                                "/Contributors"
                            )
                          }
                        >
                          List of Contributors
                        </button>
                      </div>
                    </>
                  </>
                ) : (
                  <div>
                    <>
                      <p>
                        This looks like an interesting project, you should
                        INVEST
                      </p>
                    </>

                    <form
                      className="flex flex-col"
                      onSubmit={submitTransaction}
                    >
                      <label>
                        Enter in amount in Sol{" "}
                        <input
                          className="text-black"
                          value={transactionValue}
                          onChange={(e) => setTransactionValue(e.target.value)}
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300 m-4"
                      >
                        <p>Invest Sol</p>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <p>Connect wallet to Invest</p>
            )}
          </div>
        </div>
      </>
    );
  }
};

export default ExploreTreasury;
