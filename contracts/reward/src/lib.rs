#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Env, Address};

#[contracttype]
pub enum DataKey {
    Admin,
    RewardToken,
}

#[contract]
pub struct RewardContract;

#[contractimpl]
impl RewardContract {
    pub fn initialize(env: Env, admin: Address, reward_token: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::RewardToken, &reward_token);
    }

    pub fn mint_reward(env: Env, recipient: Address, split_count: i128) {
        let token_id: Address = env.storage().instance()
            .get(&DataKey::RewardToken).unwrap();
        let token_client = token::StellarAssetClient::new(&env, &token_id);
        let reward_amount = split_count * 100_0000000i128;
        token_client.mint(&recipient, &reward_amount);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}
