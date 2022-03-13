use anchor_lang::prelude::*;

declare_id!("3rp6TT3ozCHM3bDw43G5zXStqqao5TwLYCTj8DgEtz8T");

#[program]
pub mod ennector {
    use super::*;

    pub fn init_treasury(ctx: Context<InitTreasury>) -> Result<()> {
        // ctx.accounts.treasury_account.core_members = core_members;
        ctx.accounts.treasury_account.core_members = 10;
        Ok(())
    }

    // pub fn deposit_treasury(ctx: Context<DepositTreasury>, amount: u8) -> Result<()> {

    // }
}

#[derive(Accounts)]
pub struct InitTreasury<'info> {
    #[account(init, payer = user, space = 16 + 16, seeds = [b"treasury_account".as_ref(), user.key.as_ref()],bump)]
    // #[account(init, payer = user, space = 16 + 64)]
    pub treasury_account: Account<'info, TreasuryAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// pub struct DepositTreasury<'info> {
//     #[account(mut)]
// }

#[account]
pub struct TreasuryAccount {
    pub core_members: u8,
}
