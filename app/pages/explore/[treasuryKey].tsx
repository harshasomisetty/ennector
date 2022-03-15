import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";
import {Program, Provider, web3} from "@project-serum/anchor";
import {Connection, PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import getProvider from "../../utils/provider";
import idl from "../../idl.json";
const programID = new PublicKey(idl.metadata.address);

const ExploreTreasury = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coreMembers, setCoreMembers] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const {publicKey, sendTransaction} = useWallet();
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
        setName(data["name"]);
        setDescription(data["description"]);
        setCoreMembers(accountInfo.coreMembers);
        setStartingPrice(accountInfo.startingPrice);

        const treasuryBalFetch = await provider.connection.getBalance(
          creatorTreasury
        );
        setTreasuryBalance(treasuryBalFetch / LAMPORTS_PER_SOL);
      }
      findTreasury();
    }
  }, [router.isReady]);
  if (!coreMembers) {
    return <p>Loading</p>;
  } else {
    return (
      <div className="flex flex-col space-y-10 text-center">
        <div className="border">
          <p>Name: {name}</p>
          <p>Description: {description}</p>
          <p>Treasury: {treasuryKey}</p>
          <p>CoreMembers: {coreMembers}</p>
          <p>Starting Price: {startingPrice}</p>
          <p>Treasury Balance: {treasuryBalance} </p>
        </div>

        <div>
          {publicKey ? (
            <div>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg px-4 py-3 bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300"
              >
                <p>Invest</p>
              </button>
              {showModal ? (
                /* https://www.creative-tim.com/learning-lab/tailwind-starter-kit/documentation/react/modals/regular */
                <>
                  <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                    <div className="relative w-auto my-6 mx-auto max-w-3xl">
                      {/*content*/}
                      <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-blue-400 outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                          <h3 className="text-3xl font-semibold">
                            Modal Title
                          </h3>
                          <button
                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                            onClick={() => setShowModal(false)}
                          >
                            <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                              ×
                            </span>
                          </button>
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto">
                          <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                            I always felt like I could do anything. That’s the
                            main thing people are controlled by! Thoughts- their
                            perception of themselves! They're slowed down by
                            their perception of themselves. If you're taught you
                            can’t do anything, you won’t do anything. I was
                            taught I could do everything.
                          </p>
                        </div>
                        {/*footer*/}
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                          <button
                            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                            onClick={() => setShowModal(false)}
                          >
                            Close
                          </button>
                          <button
                            className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                            onClick={() => setShowModal(false)}
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
              ) : null}
            </div>
          ) : (
            <p>connect wallet plis</p>
          )}
        </div>
      </div>
    );
  }
};

export default ExploreTreasury;
