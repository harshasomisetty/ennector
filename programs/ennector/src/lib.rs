use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use rust_decimal::prelude::*;
use solana_program;
use solana_program::{
    // clock::Clock,
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    program::invoke,
    system_instruction,
};

declare_id!("3rp6TT3ozCHM3bDw43G5zXStqqao5TwLYCTj8DgEtz8T");

#[program]
pub mod ennector {
    use super::*;

    // TODO Fix imports by adding to  instructions
    pub fn init_treasury(
        ctx: Context<InitTreasury>,
        name: String,
        core_members: u8,
        starting_price: u8,
        council_count: u8,
        initial_cashout: String,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_account;
        treasury.name = name;
        treasury.core_members = core_members;
        treasury.starting_price = starting_price;
        treasury.council_count = council_count;
        treasury.initial_cashout = initial_cashout;
        treasury.preseed = true;

        // start tracking mint

        // allow program to be mint authority and freeze authority

        // init council mint

        // init community mint

        Ok(())
    }

    pub fn deposit_treasury(ctx: Context<DepositTreasury>, amount: u64) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_account;
        let depositor = &mut ctx.accounts.depositor;
        let system_prog = &mut ctx.accounts.system_program;
        let deposit_map = &mut ctx.accounts.deposit_map;

        invoke(
            &system_instruction::transfer(
                &depositor.to_account_info().key,
                &treasury.to_account_info().key,
                amount,
            ),
            &[
                depositor.to_account_info().clone(),
                treasury.to_account_info().clone(),
                system_prog.to_account_info().clone(),
            ],
        )?;

        // TODO is & right here?
        let depositor_history = &deposit_map.deposit_amount;

        // Check if the depositor has previously sent money to treasury.
        if depositor_history == &(0 as u64) {
            // TODO create token account for depositee, add one token, freeze account
        }

        // Updating the depositor's history of sending money.
        deposit_map.deposit_amount = depositor_history + amount;

        Ok(())
    }

    pub fn end_preseed(ctx: Context<EndPreseed>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_account;
        // treasury.preseed = false;
        // treasury.council_count;
        // treasury_price;

        // TODO close tracking mint

        // TODO array of accounts to mint to for council
        // find by seeing who owns coins from the preseed mint
        // .getParsedTokenAccountsByOwner(owner, { mint: mint });
        // this is rpc call, see if possible to do in contract

        // otherwise do through client and rpc, but less web3
        // (with rpc, get list of who donated, then here we can see how much each person donated)

        // TODO mint tokens for council

        // TODO send signer funds
        // system_instruction::send_10% from treasury to signer
        // let to_send = Decimal::from_str(&treasury.initial_cashout).unwrap();
        // let total = to_send * treasury.to_account_info().lamports();

        // TODO mint tokens for community, proportional to starting price parameter
        let treasury_balance = treasury.to_account_info().lamports();
        // calculate price

        // TODO init swap

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, core_members: u8, starting_price: u8, council_count: u8, initial_cashout: String)]
pub struct InitTreasury<'info> {
    #[account(init, payer = creator, seeds = [b"treasury_account".as_ref(), creator.key.as_ref(), name.as_ref()],bump)]
    pub treasury_account: Account<'info, TreasuryAccount>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct DepositTreasury<'info> {
    #[account(mut)]
    pub treasury_account: Account<'info, TreasuryAccount>,
    #[account(init_if_needed, payer = depositor, seeds = [b"treasury_map".as_ref(), depositor.key.as_ref()],bump)]
    // You need to include checks in your code that check that the initialized account cannot be reset to its initial settings after the first time it was initialized
    pub deposit_map: Account<'info, DepositTrack>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndPreseed<'info> {
    #[account(mut)]
    pub treasury_account: Account<'info, TreasuryAccount>,
}

#[account]
#[derive(Default)]
pub struct TreasuryAccount {
    pub name: String,
    pub core_members: u8,
    pub starting_price: u8,
    pub council_count: u8,
    pub initial_cashout: String,
    pub preseed: bool,
}

#[account]
#[derive(Default)]
pub struct DepositTrack {
    pub deposit_amount: u64,
}
