const { rpc, Contract, TransactionBuilder, Networks, BASE_FEE, xdr } = require('@stellar/stellar-sdk');

const RPC = new rpc.Server('https://soroban-testnet.stellar.org');
const COUNTER_ID = 'CDSDF3RZZ4TH2X2N4KJDT72P3AF2A4CLCVN3SXOKHUJ22SC7ZQIDQTFC';

async function test() {
  const contract = new Contract(COUNTER_ID);
  const fakeAccount = {
    accountId: () => COUNTER_ID,
    sequence: () => '0',
    incrementSequenceNumber: () => {},
  };
  const tx = new TransactionBuilder(fakeAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call('get_count'))
    .setTimeout(30)
    .build();

  console.log('Simulating tx...');
  try {
    const res = await RPC.simulateTransaction(tx);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
