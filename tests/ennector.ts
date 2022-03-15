// import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {Ennector} from "../target/types/ennector";

const assert = require("assert");
const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const {SystemProgram, sendAndConfirmTransaction} = anchor.web3;
import {
  PublicKey,
  Connection,
  Commitment,
  LAMPORTS_PER_SOL,
  Transaction,
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

  let chosenCoreMembers = 190;
  let chosenName = "testProject";
  let chosenStartingPrice = 69;

  let airdropVal = 2 * LAMPORTS_PER_SOL;
  it("Init treasury and airdrop", async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, airdropVal),
      "confirmed"
    );

    [creatorTreasury, accountBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("treasury_account"),
        creator.publicKey.toBuffer(),
        Buffer.from(chosenName),
      ],
      programID
    );

    const tx = await program.rpc.initTreasury(
      chosenCoreMembers,
      chosenName,
      chosenStartingPrice,
      {
        accounts: {
          treasuryAccount: creatorTreasury,
          user: creator.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [creator],
      }
    );

    const account = await program.account.treasuryAccount.fetch(
      creatorTreasury
    );

    assert.ok(account.coreMembers === chosenCoreMembers);
    assert.ok(account.name === chosenName);
    assert.ok(account.startingPrice === chosenStartingPrice);
  });

  // it("transferring funds", async () => {
  //   let transferVal = 101;

  //   await provider.connection.confirmTransaction(
  //     await provider.connection.requestAirdrop(investor.publicKey, airdropVal),
  //     "confirmed"
  //   );

  //   const investorBalance = await provider.connection.getBalance(
  //     investor.publicKey
  //   );

  //   const prevTreasuryBalance = await provider.connection.getBalance(
  //     creatorTreasury
  //   );

  //   const tx2 = await program.rpc.depositTreasury(new anchor.BN(transferVal), {
  //     accounts: {
  //       treasuryAccount: creatorTreasury,
  //       depositeeAccount: investor.publicKey,
  //       systemProgram: SystemProgram.programId,
  //     },
  //     signers: [investor],
  //   });

  //   const newTreasuryBalance = await provider.connection.getBalance(
  //     creatorTreasury
  //   );

  //   const account = await program.account.treasuryAccount.fetch(
  //     creatorTreasury
  //   );

  //   assert.ok(newTreasuryBalance - prevTreasuryBalance === transferVal);
  // });

  it("system prog transfer funds", async () => {
    let transferVal = 101;

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(investor.publicKey, airdropVal),
      "confirmed"
    );

    const investorBalance = await provider.connection.getBalance(
      investor.publicKey
    );

    const prevTreasuryBalance = await provider.connection.getBalance(
      creatorTreasury
    );

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: investor.publicKey,
        toPubkey: creatorTreasury,
        lamports: transferVal,
      })
    );

    await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [investor],
      {commitment: "confirmed"}
    );

    const newTreasuryBalance = await provider.connection.getBalance(
      creatorTreasury
    );

    const account = await program.account.treasuryAccount.fetch(
      creatorTreasury
    );

    assert.ok(newTreasuryBalance - prevTreasuryBalance === transferVal);
  });
});
