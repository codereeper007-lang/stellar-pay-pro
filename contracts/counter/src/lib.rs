#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, symbol_short};

#[contracttype]
pub enum DataKey {
    Counter,
    Owner,
}

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    pub fn initialize(env: Env, owner: Address) {
        owner.require_auth();
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Counter, &0u32);
    }

    pub fn increment(env: Env, caller: Address) -> u32 {
        caller.require_auth();
        let count: u32 = env.storage().instance()
            .get(&DataKey::Counter).unwrap_or(0);
        let new_count = count + 1;
        env.storage().instance().set(&DataKey::Counter, &new_count);
        env.events().publish((symbol_short!("INCR"),), new_count);
        new_count
    }

    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Counter).unwrap_or(0)
    }

    pub fn reset(env: Env, caller: Address) {
        caller.require_auth();
        let owner: Address = env.storage().instance()
            .get(&DataKey::Owner).unwrap();
        assert!(caller == owner, "Only owner can reset");
        env.storage().instance().set(&DataKey::Counter, &0u32);
    }
}
