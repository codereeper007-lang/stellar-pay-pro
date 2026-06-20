#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Env, Address, Vec};

#[contracttype]
pub enum DataKey {
    Admin,
    TotalSplits,
}

#[contract]
pub struct PaymentSplitter;

#[contractimpl]
impl PaymentSplitter {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSplits, &0u32);
    }

    pub fn split_payment(
        env: Env,
        payer: Address,
        token_id: Address,
        recipients: Vec<Address>,
        total_amount: i128,
    ) {
        payer.require_auth();
        let token_client = token::Client::new(&env, &token_id);
        let share = total_amount / recipients.len() as i128;
        for recipient in recipients.iter() {
            token_client.transfer(&payer, &recipient, &share);
        }
        let total: u32 = env.storage().instance()
            .get(&DataKey::TotalSplits).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSplits, &(total + 1));
    }

    pub fn get_total_splits(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalSplits).unwrap_or(0)
    }
}
