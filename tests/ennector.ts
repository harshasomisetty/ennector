import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Ennector } from "../target/types/ennector";

describe("ennector", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Ennector as Program<Ennector>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
