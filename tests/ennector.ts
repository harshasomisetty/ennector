// import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {Ennector} from "../target/types/ennector";

const assert = require("assert");
const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const {SystemProgram} = anchor.web3;
import {
  PublicKey,
  Transaction,
  Connection,
  Commitment,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

describe("ennector", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ennector as Program<Ennector>;
  const programID = new PublicKey(program.idl["metadata"]["address"]);

  const creator = anchor.web3.Keypair.generate();
  const investor = anchor.web3.Keypair.generate();

  let creatorTreasury,
    accountBump = null;

  let chosenCoreMembers = 10;

  let airdropVal = 2 * LAMPORTS_PER_SOL;
  it("Init treasury and airdrop", async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, airdropVal),
      "confirmed"
    );

    [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
      [Buffer.from("treasury_account"), creator.publicKey.toBuffer()],
      programID
    );

    const tx = await program.rpc.initTreasury({
      accounts: {
        treasuryAccount: creatorTreasury,
        user: creator.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [creator],
    });

    const account = await program.account.treasuryAccount.fetch(
      creatorTreasury
    );

    assert.ok(account.coreMembers === 10);
  });
  // it("try airdrop", async () => {
  //   let airdropVal = 100000069;

  //   await provider.connection.confirmTransaction(
  //     await provider.connection.requestAirdrop(authority, airdropVal),
  //     "confirmed"
  //   );

  //   const accountBalance = await provider.connection.getBalance(authority);

  //   assert.ok(accountBalance === airdropVal);
  // });

  // it("transferring funds", async () => {
  //   let transferVal = 100;

  //   await provider.connection.confirmTransaction(
  //     await provider.connection.requestAirdrop(investor.publicKey, airdropVal),
  //     "confirmed"
  //   );

  //   const investorBalance = await provider.connection.getBalance(
  //     investor.publicKey
  //   );

  //   const prevTreasuryBalance = await provider.connection.getBalance(creatorTreasury);

  //   await provider.rpc.depositTreasury({
  //     accounts: {},
  //   });
  // });
});
