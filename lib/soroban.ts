import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address,
  nativeToScVal,
  xdr
} from '@stellar/stellar-sdk'
import { signTx } from './wallet'

const RPC = new SorobanRpc.Server('https://soroban-testnet.stellar.org')
const COUNTER_ID = process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ID!

export async function getCount(): Promise<number> {
  try {
    const contract = new Contract(COUNTER_ID)
    const account = await RPC.getLatestLedger()
    const dummyAccount = {
      accountId: () => COUNTER_ID,
      sequenceNumber: () => '0',
      incrementSequenceNumber: () => {}
    }
    const tx = new TransactionBuilder(dummyAccount as any, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(contract.call('get_count'))
      .setTimeout(30)
      .build()
    const result = await RPC.simulateTransaction(tx)
    if (SorobanRpc.Api.isSimulationSuccess(result)) {
      return Number(result.result?.retval) || 0
    }
    return 0
  } catch (e) {
    console.error('getCount error:', e)
    return 0
  }
}

export async function callIncrement(
  publicKey: string
): Promise<{ count: number; txHash: string }> {
  const account = await RPC.getAccount(publicKey)
  const contract = new Contract(COUNTER_ID)
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      contract.call('increment', new Address(publicKey).toScVal())
    )
    .setTimeout(180)
    .build()

  const simResult = await RPC.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error('Simulation failed: ' + simResult.error)
  }

  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build()
  const signedXDR = await signTx(assembled.toXDR(), Networks.TESTNET)
  const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
  const sendResult = await RPC.sendTransaction(signedTx)

  return { count: await getCount(), txHash: sendResult.hash }
}

export async function callSplitter(
  publicKey: string,
  tokenId: string,
  recipients: string[],
  totalAmount: string
): Promise<{ txHash: string }> {
  const SPLITTER_ID = process.env.NEXT_PUBLIC_PAYMENT_SPLITTER_ADDRESS!
  const account = await RPC.getAccount(publicKey)
  const contract = new Contract(SPLITTER_ID)

  const recipientAddresses = recipients.map(r => new Address(r).toScVal())
  const amountScVal = nativeToScVal(
    BigInt(Math.floor(parseFloat(totalAmount) * 10_000_000)),
    { type: 'i128' }
  )

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      contract.call(
        'split_payment',
        new Address(publicKey).toScVal(),
        new Address(tokenId).toScVal(),
        xdr.ScVal.scvVec(recipientAddresses),
        amountScVal
      )
    )
    .setTimeout(180)
    .build()

  const simResult = await RPC.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error('Simulation failed: ' + simResult.error)
  }

  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build()
  const signedXDR = await signTx(assembled.toXDR(), Networks.TESTNET)
  const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
  const sendResult = await RPC.sendTransaction(signedTx)

  return { txHash: sendResult.hash }
}
