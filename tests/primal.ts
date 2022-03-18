import {Primal} from "../target/types/primal";
const assert = require("assert");
import {Program} from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
const {SystemProgram, SYSVAR_RENT_PUBKEY} = anchor.web3;
import {PublicKey, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint,
  getAssociatedTokenAddress,
  getAccount,
} from "@solana/spl-token";

const provider = anchor.Provider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Primal as Program<Primal>;
const programID = new PublicKey(program.idl["metadata"]["address"]);

describe("primal", () => {
  // Configure the client to use the local cluster.

  const creator = anchor.web3.Keypair.generate();
  const testInvestor = anchor.web3.Keypair.generate();
  const investor = anchor.web3.Keypair.generate();
  const investor2 = anchor.web3.Keypair.generate();

  let treasuryAccount,
    coreMint,
    coreDepositWallet,
    coreDepositWallet2,
    primalMint,
    memberMint,
    depositMap;

  let treasuryBump, coreBump, primalBump, memberBump, depositBump;

  let chosenName = "testProject";
  let chosenPrimalMembers = 190;
  let chosenStartingPrice = 69;
  let chosenPrimalCount = 169;
  let chosenInitialCashout = 10;

  let airdropVal = 20 * LAMPORTS_PER_SOL;
  let transferVal = 2 * LAMPORTS_PER_SOL;

  it("init variables", async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, airdropVal),
      "confirmed"
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(investor.publicKey, airdropVal),
      "confirmed"
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(investor2.publicKey, airdropVal),
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

    [depositMap, depositBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("deposit_map"),
        treasuryAccount.toBuffer(),
        investor.publicKey.toBuffer(),
      ],
      programID
    );

    coreDepositWallet = await getAssociatedTokenAddress(
      coreMint,
      investor.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    coreDepositWallet2 = await getAssociatedTokenAddress(
      coreMint,
      investor2.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  });

  it("Init treasury", async () => {
    const tx = await program.rpc.initTreasury(
      chosenName,
      chosenPrimalMembers,
      chosenStartingPrice,
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

    let treasuryAccountInfo = await program.account.treasuryAccount.fetch(
      treasuryAccount
    );

    assert.ok(treasuryAccountInfo.primalMembers === chosenPrimalMembers);
    assert.ok(treasuryAccountInfo.name === chosenName);
    assert.ok(treasuryAccountInfo.startingPrice === chosenStartingPrice);
    assert.ok(treasuryAccountInfo.preseedStatus === true);
  });
  it("testing investing into treasury and return mint", async () => {
    let investorBalance = await provider.connection.getBalance(
      investor.publicKey
    );

    let prevTreasuryBalance = await provider.connection.getBalance(
      treasuryAccount
    );

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

    let newTreasuryBalance1 = await provider.connection.getBalance(
      treasuryAccount
    );

    assert.ok(newTreasuryBalance1 - prevTreasuryBalance === transferVal);

    // const coreMintInfo = await getMint(provider.connection, coreMint);
    // console.log(coreMintInfo);

    let postBal = await getAccount(provider.connection, coreDepositWallet);

    assert.ok(Number(postBal.amount) == 1);

    // const depoMapData = await provider.connection.getAccountInfo(depositMap);
    // console.log(depoMapData.depositAmount);
    let depoMapData = await program.account.depositTrack.fetch(depositMap);
    assert.ok(depoMapData.depositAmount.toNumber() == transferVal);

    const tx3 = await program.rpc.depositTreasury(
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

    // const tx4 = await program.rpc.depositTreasury(
    //   treasuryBump,
    //   new anchor.BN(transferVal),
    //   {
    //     accounts: {
    //       treasuryAccount: treasuryAccount,
    //       depositMap: depositMap,
    //       coreMint: coreMint,
    //       coreDepositWallet: coreDepositWallet2,
    //       depositor: investor2.publicKey,
    //       creator: creator.publicKey,
    //       systemProgram: anchor.web3.SystemProgram.programId,
    //       tokenProgram: TOKEN_PROGRAM_ID,
    //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //     },
    //     signers: [investor2],
    //   }
    // );

    // assert.ok(newTreasuryBalance1 - newTreasuryBalance1 === transferVal);

    // const coreMintInfo = await getMint(provider.connection, coreMint);
    // console.log(coreMintInfo);

    postBal = await getAccount(provider.connection, coreDepositWallet);

    assert.ok(Number(postBal.amount) == 1);

    depoMapData = await program.account.depositTrack.fetch(depositMap);
    assert.ok(depoMapData.depositAmount.toNumber() == transferVal * 2);
    console.log("final depo", depoMapData.depositAmount.toNumber());
  });

  it("closing preseed", async () => {
    let prevTreasuryBalance = await provider.connection.getBalance(
      treasuryAccount
    );

    const tx5 = await program.rpc.endPreseed(treasuryBump, {
      accounts: {
        treasuryAccount: treasuryAccount,
        creatorAccount: creator.publicKey,
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [creator],
    });

    let postTreasuryBalance = await provider.connection.getBalance(
      treasuryAccount
    );

    assert.ok(Number(postTreasuryBalance) / Number(prevTreasuryBalance) < 0.91);

    let treasuryAccountInfo = await program.account.treasuryAccount.fetch(
      treasuryAccount
    );

    console.log("status", treasuryAccountInfo.preseedStatus);
    assert.ok(treasuryAccountInfo.preseedStatus === false);
  });
});
