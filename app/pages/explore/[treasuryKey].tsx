import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {Program, Provider, web3} from "@project-serum/anchor";
const {SystemProgram} = web3;
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import getProvider from "../../utils/provider";
import idl from "../../idl.json";
import sleep from "../../utils/sleep";

const programID = new PublicKey(idl.metadata.address);
const connection = new Connection("http://localhost:8899");

const ExploreTreasury = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coreMembers, setCoreMembers] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [transactionValue, setTransactionValue] = useState(1);
  const [preseedStage, setPreseedStage] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [creatorKey, setCreatorKey] = useState("");
  const [creatorLogged, setCreatorLogged] = useState(true); // replace later
  const router = useRouter();
  const {wallet, publicKey, sendTransaction} = useWallet();

  const {treasuryAccount} = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    else {
      async function findTreasury() {
        let response = await fetch(
          "http://localhost:3000/api/checkProject/" + treasuryAccount
        );
        let data = await response.json();

        const provider = await getProvider(wallet);
        const program = new Program(idl, programID, provider);

        let creatorAccount = new PublicKey(data["walletKey"]);
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
        setCoreMembers(accountInfo.coreMembers);
        setStartingPrice(accountInfo.startingPrice);
        setPreseedStage(accountInfo.preseedStage);

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

  if (!coreMembers) {
    return <p>Loading</p>;
  } else {
    return (
      <div className="flex flex-row justify-around text-center">
        <div className="border">
          <p>Name: {name}</p>
          <p>Description: {description}</p>
          <p>Treasury: {treasuryAccount}</p>
          <p>CoreMembers: {coreMembers}</p>
          <p>Starting Price: {startingPrice}</p>
          <p>Treasury Balance: {treasuryBalance} </p>
        </div>

        <div>
          {publicKey ? (
            <div>
              <p>connected lksdjf sdlkfjsdf sdlkj </p>
              {creatorLogged ? (
                <>
                  {preseedStage ? (
                    <Button>Close Preseed</Button>
                  ) : (
                    <Button>Raise Funs</Button>
                  )}
                </>
              ) : (
                <div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300 m-4"
                  >
                    <p>Invest</p>
                  </button>
                  {showModal ? (
                    /* https://www.creative-tim.com/learning-lab/tailwind-starter-kit/documentation/react/modals/regular */
                    <>
                      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none relative w-auto my-6 mx-auto max-w-3xl">
                        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-gray-700 outline-none focus:outline-none">
                          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                            <div className="flex flex-row items-end">
                              <h3 className="text-3xl font-medium">
                                Invest in
                              </h3>
                              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-blue-600">
                                &nbsp;{name}
                              </h1>
                            </div>
                            <button
                              className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                              onClick={() => setShowModal(false)}
                            >
                              <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                ×
                              </span>
                            </button>
                          </div>
                          <div className="relative p-6 flex-auto my-4 text-blueGray-500 text-lg leading-relaxed">
                            <form
                              className="flex flex-col"
                              onSubmit={submitTransaction}
                            >
                              <label>
                                Enter in amount in Sol{" "}
                                <input
                                  className="text-black"
                                  value={transactionValue}
                                  onChange={(e) =>
                                    setTransactionValue(e.target.value)
                                  }
                                />
                              </label>
                              <button
                                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="submit"
                              >
                                Submit Transaction
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                    </>
                  ) : null}
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
