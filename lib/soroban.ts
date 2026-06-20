import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address
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
  token: string,
  numTotal: number,
  recipients: string[]
): Promise<{ txHash: string }> {
  return { txHash: 'simulated_hash' }
}
