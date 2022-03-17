import {Ennector} from "../target/types/ennector";
const assert = require("assert");
import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
const serumCmn = require("@project-serum/common");

const {SystemProgram, sendAndConfirmTransaction, SYSVAR_RENT_PUBKEY} =
  anchor.web3;
import {
  PublicKey,
  Connection,
  Commitment,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  getMint,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";

const provider = anchor.Provider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Ennector as Program<Ennector>;
const programID = new PublicKey(program.idl["metadata"]["address"]);

describe("ennector", () => {
  // Configure the client to use the local cluster.

  const creator = anchor.web3.Keypair.generate();
  const testInvestor = anchor.web3.Keypair.generate();
  const investor = anchor.web3.Keypair.generate();

  let treasuryAccount,
    coreMint,
    primalMint,
    memberMint = null;

  let treasuryBump,
    coreBump,
    primalBump,
    memberBump = null;

  let chosenName = "testProject";
  let chosenPrimalMembers = 190;
  let chosenStartingPrice = 69;
  let chosenPrimalCount = 169;
  let chosenInitialCashout = ".10";

  let airdropVal = 2 * LAMPORTS_PER_SOL;

  it("Init treasury", async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, airdropVal),
      "confirmed"
    );

    [treasuryAccount, treasuryBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("treasury_account"),
        creator.publicKey.toBuffer(),
        Buffer.from(chosenName),
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

    console.log("before tx");
    const tx = await program.rpc.initTreasury(
      chosenName,
      chosenPrimalMembers,
      chosenStartingPrice,
      chosenPrimalCount,
      chosenInitialCashout,
      {
        accounts: {
          treasuryAccount: treasuryAccount,
          coreMint: coreMint,
          primalMint: primalMint,
          memberMint: memberMint,
          creator: creator.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
        signers: [creator],
      }
    );
    console.log("after tx");

    const treasuryAccountInfo = await program.account.treasuryAccount.fetch(
      treasuryAccount
    );

    assert.ok(treasuryAccountInfo.primalMembers === chosenPrimalMembers);
    assert.ok(treasuryAccountInfo.name === chosenName);
    assert.ok(treasuryAccountInfo.startingPrice === chosenStartingPrice);
    console.log("treasury account okay");
  });
  it("testing investing into treasury and return mint", async () => {
    let transferVal = 101;

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(investor.publicKey, airdropVal),
      "confirmed"
    );

    const investorBalance = await provider.connection.getBalance(
      investor.publicKey
    );

    const prevTreasuryBalance = await provider.connection.getBalance(
      treasuryAccount
    );

    let [depositMap, depositBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("deposit_map"),
        treasuryAccount.toBuffer(),
        investor.publicKey.toBuffer(),
      ],
      programID
    );

    let coreDepositWallet = await getAssociatedTokenAddress(
      coreMint,
      investor.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log("treasury", treasuryAccount.toString());
    console.log("depo map", depositMap.toString());
    console.log("core mint", coreMint.toString());
    console.log("core depo", coreDepositWallet.toString());
    console.log("investor", investor.publicKey.toString());
    console.log("creator", creator.publicKey.toString());

    const tx2 = await program.rpc.depositTreasury(
      treasuryBump,
      new anchor.BN(transferVal),
      {
        accounts: {
          treasuryAccount: treasuryAccount,
          depositMap: depositMap,
          coreMint: coreMint,
          coreDepositWallet: coreDepositWallet,
          depositor: investor.publicKey,
          creator: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [investor],
      }
    );

    const newTreasuryBalance = await provider.connection.getBalance(
      treasuryAccount
    );

    const account = await program.account.treasuryAccount.fetch(
      treasuryAccount
    );

    assert.ok(newTreasuryBalance - prevTreasuryBalance === transferVal);

    const coreMintInfo = await getMint(provider.connection, coreMint);
    // console.log(coreMintInfo);

    const postBal = await getAccount(provider.connection, coreDepositWallet);
    console.log(postBal);
  });
});
