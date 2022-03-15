use anchor_lang::prelude::*;
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

    pub fn init_treasury(
        ctx: Context<InitTreasury>,
        core_members: u8,
        name: String,
        starting_price: u8,
    ) -> Result<()> {
        ctx.accounts.treasury_account.core_members = core_members;
        ctx.accounts.treasury_account.name = name;
        ctx.accounts.treasury_account.starting_price = starting_price;
        Ok(())
    }

    pub fn deposit_treasury(ctx: Context<DepositTreasury>, amount: u64) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_account;
        let depositee = &mut ctx.accounts.depositee_account;
        let system_prog = &mut ctx.accounts.system_program;

        invoke(
            &system_instruction::transfer(
                &depositee.to_account_info().key,
                &treasury.to_account_info().key,
                amount,
            ),
            &[
                depositee.to_account_info().clone(),
                treasury.to_account_info().clone(),
                system_prog.to_account_info().clone(),
            ],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(core_members: u8, name: String, starting_price: u8)]
pub struct InitTreasury<'info> {
    #[account(init, payer = user, space = 16 + 16, seeds = [b"treasury_account".as_ref(), user.key.as_ref(), name.as_ref()],bump)]
    // #[account(init, payer = user, space = 16 + 64)]
    pub treasury_account: Account<'info, TreasuryAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct DepositTreasury<'info> {
    #[account(mut)]
    pub treasury_account: Account<'info, TreasuryAccount>,
    #[account(mut)]
    pub depositee_account: Signer<'info>,
    pub system_program: Program<'info, System>,
    // pub system_program: Program<'info, System>,
}

#[account]
pub struct TreasuryAccount {
    pub core_members: u8,
    pub name: String,
    pub starting_price: u8,
}
