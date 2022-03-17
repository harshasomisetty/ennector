import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import {useWallet} from "@solana/wallet-adapter-react";
import {Program, Provider, web3} from "@project-serum/anchor";
const {SystemProgram} = web3;
import {PublicKey, LAMPORTS_PER_SOL, Transaction} from "@solana/web3.js";
import getProvider from "../../utils/provider";
import idl from "../../idl.json";
import sleep from "../../utils/sleep";

const programID = new PublicKey(idl.metadata.address);

const ExploreTreasury = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primalMembers, setPrimalMembers] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [initialCashout, setInitialCashout] = useState("0");
  const [preseedStatus, setPreseedStatus] = useState(false);

  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [creatorKey, setCreatorKey] = useState("");

  const [transactionValue, setTransactionValue] = useState(1);

  const [rerender, setRerender] = useState(false);

  const [creatorLogged, setCreatorLogged] = useState(true); // replace later

  const router = useRouter();

  const {wallet, publicKey, sendTransaction} = useWallet();
  const {treasuryAccount} = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    else {
      async function findTreasury() {
        console.log(
          "http://localhost:3000/api/checkProject/" + treasuryAccount
        );
        let response = await fetch(
          "http://localhost:3000/api/checkProject/" + treasuryAccount
        );
        let data = await response.json();

        const provider = await getProvider(wallet);
        const program = new Program(idl, programID, provider);

        let creatorAccount = new PublicKey(data["creator"]);
        setCreatorKey(creatorAccount.toString());
        let [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
          [
            Buffer.from("treasury_account"),
            creatorAccount.toBuffer(),
            Buffer.from(data["name"]),
          ],
          programID
        );

        let accountInfo = await program.account.treasuryAccount.fetch(
          creatorTreasury
        );

        setName(data["name"]);
        setDescription(data["description"]);
        setPrimalMembers(accountInfo.primalMembers);
        setStartingPrice(accountInfo.startingPrice);
        setPreseedStatus(accountInfo.preseedStatus);

        const treasuryBalFetch = await provider.connection.getBalance(
          creatorTreasury
        );

        setTreasuryBalance(treasuryBalFetch / LAMPORTS_PER_SOL);
      }
      findTreasury();
    }
  }, [router.isReady, rerender]);

  async function submitTransaction() {
    event.preventDefault();

    const provider = await getProvider(wallet);
    const investorBalance = await provider.connection.getBalance(publicKey);

    if (investorBalance / LAMPORTS_PER_SOL < transactionValue) {
      console.log("Account Balance not enough, please add more sol");
    } else {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(treasuryAccount),
          lamports: transactionValue * LAMPORTS_PER_SOL,
        })
      );

      await sendTransaction(transaction, provider.connection);
      await sleep(1000);
      setRerender(!rerender);
    }

    setShowModal(false);
  }

  if (!primalMembers) {
    return <p>Loading</p>;
  } else {
    return (
      <div className="flex flex-row justify-around text-center">
        <div className="border">
          <p>Name: {name}</p>
          <p>Description: {description}</p>
          <p>Treasury: {treasuryAccount}</p>
          <p>PrimalMembers: {primalMembers}</p>
          <p>Starting Price: {startingPrice}</p>
          <p>Treasury Balance: {treasuryBalance} </p>
        </div>

        <div>
          {publicKey ? (
            <div>
              {publicKey === creatorKey ? (
                <>
                  <p>You Created this Project! </p>
                  {preseedStatus ? (
                    <button className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300 m-4">
                      Close Preseed
                    </button>
                  ) : (
                    <button className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300 m-4">
                      Raise Fund
                    </button>
                  )}
                </>
              ) : (
                <div>
                  <>
                    <p>
                      This looks like an interesting project, you should INVEST
                    </p>
                  </>

                  <form className="flex flex-col" onSubmit={submitTransaction}>
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
    );
  }
};

export default ExploreTreasury;
