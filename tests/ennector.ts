// import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {Ennector} from "../target/types/ennector";

const assert = require("assert");
const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const {SystemProgram} = anchor.web3;
import {PublicKey, Transaction, Connection, Commitment} from "@solana/web3.js";

describe("ennector", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ennector as Program<Ennector>;
  const connection = provider.connection;
  const authority = anchor.web3.Keypair.generate();
  const programID = program.idl["metadata"]["address"];

  console.log("authority: ", authority.publicKey.toString());
  console.log("provider: ", provider.wallet.publicKey.toString());

  it("Is initialized!", async () => {
    // Add your test here.

    // let [baseAccount, accountBump] = await PublicKey.findProgramAddress(
    //   [Buffer.from("data_account"), provider.wallet.publicKey.toBuffer()],
    //   programID
    // );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(authority.publicKey, 100000069),
      "confirmed"
    );

    const tx = await program.rpc.initTreasury({
      accounts: {
        treasuryAccount: authority.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    console.log("Your transaction signature", tx);

    const account = await program.account.treasuryAccount.fetch(
      authority.publicKey
    );

    const accountInfo = await connection.getBalance(authority.publicKey);

    console.log("data, ", account.data);
    console.log("info", accountInfo);
    assert.ok(account.data === "data");
  });
});
