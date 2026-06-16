import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address,
  xdr,
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
  return cachedFetch(
    'counter:count',
    async () => {
      const contract = new Contract(COUNTER_ID)

      // Throwaway source account (contract itself, seq 0)
      const fakeAccount = {
        accountId: () => COUNTER_ID,
        sequence: () => '0',
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
      if (SorobanRpc.Api.isSimulationError(result)) return 0

      const retval = (result as any).result?.retval
      if (!retval) return 0
      try {
        const decoded = xdr.ScVal.fromXDR(retval, 'base64')
        return decoded.switch().name === 'scvU32' ? decoded.u32() : 0
      } catch {
        return 0
      }
    },
    5000
  )
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

  // Bust the cached count so next read is fresh
  cache.invalidate('counter:count')
  const newCount = await getCount()
  return { count: newCount, txHash: sendResult.hash }
}
