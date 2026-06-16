import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address,
  Keypair,
  xdr,
  Operation,
  Asset
} from '@stellar/stellar-sdk'
import { signWithKit } from './wallet'
import { cachedFetch, cache } from './cache'

const RPC = new SorobanRpc.Server('https://soroban-testnet.stellar.org')

const COUNTER_ID =
  process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ID ??
  'CDSDF3RZZ4TH2X2N4KJDT72P3AF2A4CLCVN3SXOKHUJ22SC7ZQIDQTFC'

const REWARD_ID =
  process.env.NEXT_PUBLIC_REWARD_CONTRACT_ID ??
  'CDIS7IB6CSFWLDEOTGQ6KLGKHKOO4NGZ42HQDUXPE5WANS3VRH3BGLVB'

const SPLITTER_ID =
  process.env.NEXT_PUBLIC_SPLITTER_CONTRACT_ID ??
  'CBTMVK7RTG6RHTQF2SDCFHXPDIULZBBIXVELUUFOBJPZJTDOSTBHBKHB'

export const CONTRACT_IDS = {
  counter: COUNTER_ID,
  reward: REWARD_ID,
  splitter: SPLITTER_ID,
}

/** Poll until tx leaves PENDING or NOT_FOUND (max ~30 s) */
async function waitForTransaction(hash: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    try {
      const check = await RPC.getTransaction(hash)
      const st = (check as any).status as string
      if (st && st !== 'NOT_FOUND' && st !== 'PENDING') return st
    } catch {
      // keep waiting
    }
  }
  return 'TIMEOUT'
}

/**
 * Read the current counter value via RPC simulation (no signature).
 */
export async function getCount(): Promise<number> {
  const contract = new Contract(COUNTER_ID)

  // Use a random throwaway keypair — must be a valid G-address
  const fakeAccount = {
    accountId: () => Keypair.random().publicKey(),
    sequenceNumber: () => '0',
    incrementSequenceNumber: () => {},
  } as any

  const tx = new TransactionBuilder(fakeAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call('get_count'))
    .setTimeout(30)
    .build()

  const result = await RPC.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(result)) {
    throw new Error('Simulation error: ' + (result as any).error)
  }

  const retval = (result as any).result?.retval
  if (!retval) throw new Error('No retval in simulation result')

  // SDK v16 returns ChildUnion directly (not base64 string)
  if (typeof retval === 'object' && typeof retval.switch === 'function') {
    const sw = retval.switch()
    if (sw.name === 'scvU32') return retval.u32() as number
    throw new Error('Unexpected retval type: ' + sw.name)
  }

  // Fallback: older SDK base64 string format
  try {
    const decoded = xdr.ScVal.fromXDR(retval as string, 'base64')
    if (decoded.switch().name === 'scvU32') return decoded.u32()
  } catch {}

  throw new Error('Could not decode retval')
}

/**
 * Call `increment` on the Counter contract — requires wallet signing.
 */
export async function callIncrement(
  publicKey: string
): Promise<{ count: number; txHash: string }> {
  const account = await RPC.getAccount(publicKey)
  const contract = new Contract(COUNTER_ID)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call('increment', new Address(publicKey).toScVal()))
    .setTimeout(180)
    .build()

  const simResult = await RPC.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error('Simulation failed: ' + (simResult as any).error)
  }

  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build()
  const signedXDR = await signWithKit(assembled.toXDR(), publicKey)
  const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)

  const sendResult = await RPC.sendTransaction(signedTx)
  if ((sendResult as any).status === 'ERROR') {
    throw new Error('Send failed: ' + JSON.stringify(sendResult))
  }

  await waitForTransaction(sendResult.hash)

  // Small delay to let ledger settle, then get fresh count
  await new Promise(r => setTimeout(r, 1000))
  const newCount = await getCount()
  return { count: newCount, txHash: sendResult.hash }
}

/**
 * Call `split` on the Splitter contract, fallback to standard payment operations if ABI mismatch.
 */
export async function callSplitter(
  publicKey: string,
  token: 'XLM' | 'SDT',
  amount: number,
  recipients: string[]
): Promise<{ txHash: string }> {
  const account = await RPC.getAccount(publicKey)
  const contract = new Contract(SPLITTER_ID)
  
  const tokenAddress = token === 'XLM' 
    ? 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC' // Native XLM on testnet
    : REWARD_ID

  let assembledTx: any

  try {
    const tokenArg = new Address(tokenAddress).toScVal()
    const amountStroops = Math.floor(amount * 1e7)
    
    // We mock an i128 representing the amount
    const amountArg = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        hi: new xdr.Int64([0, 0]),
        lo: xdr.Uint64.fromString(amountStroops.toString())
      })
    )
    
    const recipientsArg = xdr.ScVal.scvVec(
      recipients.map(r => new Address(r).toScVal())
    )

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call('split', tokenArg, amountArg, recipientsArg))
      .setTimeout(180)
      .build()

    const simResult = await RPC.simulateTransaction(tx)
    if (SorobanRpc.Api.isSimulationError(simResult)) {
       throw new Error('Simulation error')
    }
    assembledTx = SorobanRpc.assembleTransaction(tx, simResult).build()
  } catch (e) {
    // FALLBACK: If simulation fails due to ABI mismatch, execute standard native split
    // Fetch account again because the first TransactionBuilder incremented the sequence number!
    const fallbackAccount = await RPC.getAccount(publicKey)
    
    const fallbackTxBuilder = new TransactionBuilder(fallbackAccount, { 
      fee: (parseInt(BASE_FEE) * recipients.length).toString(), 
      networkPassphrase: Networks.TESTNET 
    })
    
    const splitAmount = (amount / recipients.length).toFixed(7)
    
    for (const r of recipients) {
      fallbackTxBuilder.addOperation(
        Operation.payment({
          destination: r,
          asset: Asset.native(),
          amount: splitAmount
        })
      )
    }
    assembledTx = fallbackTxBuilder.setTimeout(180).build()
  }

  const signedXDR = await signWithKit(assembledTx.toXDR(), publicKey)
  const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)

  const sendResult = await RPC.sendTransaction(signedTx)
  if ((sendResult as any).status === 'ERROR') {
    throw new Error('Send failed: ' + JSON.stringify(sendResult))
  }

  await waitForTransaction(sendResult.hash)
  return { txHash: sendResult.hash }
}
