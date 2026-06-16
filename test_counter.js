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
  const res = await RPC.simulateTransaction(tx);
  
  const isError = rpc.Api.isSimulationError(res);
  console.log('isSimulationError:', isError);
  console.log('result keys:', Object.keys(res));
  console.log('res.result:', res.result);
  
  if (res.result && res.result.retval) {
    const retval = res.result.retval;
    console.log('retval type:', typeof retval);
    console.log('retval constructor:', retval.constructor?.name);
    if (retval.switch) {
      const sw = retval.switch();
      console.log('switch name:', sw.name, 'value:', sw.value);
      if (sw.name === 'scvU32') {
        console.log('COUNT:', retval.u32());
      }
    }
  }
}
test().catch(console.error);
