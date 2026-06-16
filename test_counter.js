const COUNTER_ID = 'CDSDF3RZZ4TH2X2N4KJDT72P3AF2A4CLCVN3SXOKHUJ22SC7ZQIDQTFC';
async function test() {
  const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, Keypair } = require('@stellar/stellar-sdk');
  const RPC = new rpc.Server('https://soroban-testnet.stellar.org');
  
  const contract = new Contract(COUNTER_ID);
  const fakeAccount = {
    accountId: () => Keypair.random().publicKey(),
    sequenceNumber: () => '0',
    incrementSequenceNumber: () => {},
  };
  
  const tx = new TransactionBuilder(fakeAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call('get_count'))
    .setTimeout(30)
    .build();

  console.log('Simulating tx for get_count...');
  try {
    const res = await RPC.simulateTransaction(tx);
    console.log("Assembly:", typeof rpc.assembleTransaction);
    const assembled = rpc.assembleTransaction(tx, res).build();
    console.log("Assembled XDR:", assembled.toXDR());
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
