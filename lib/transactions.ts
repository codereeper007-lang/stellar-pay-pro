import {
  Horizon,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Asset,
  Memo
} from '@stellar/stellar-sdk'
import { signWithKit } from './wallet'
import { parseHorizonError, UserRejectedError } from './errors'
import type { TransactionResult } from '@/types'

const server = new Horizon.Server('https://horizon-testnet.stellar.org')

export async function sendXLM(params: {
  sourcePublicKey: string
  destination: string
  amount: string
  memo?: string
  onStatus?: (status: 'signing' | 'sending') => void
}): Promise<TransactionResult> {
  try {
    const account = await server.loadAccount(params.sourcePublicKey)
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination: params.destination,
          asset: Asset.native(),
          amount: params.amount
        })
      )
      .addMemo(params.memo ? Memo.text(params.memo) : Memo.none())
      .setTimeout(180)
      .build()

    if (params.onStatus) params.onStatus('signing')
    const signedXDR = await signWithKit(
      tx.toXDR(),
      params.sourcePublicKey
    )
    if (params.onStatus) params.onStatus('sending')
    const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET)
    const result = await server.submitTransaction(signedTx)
    return { success: true, hash: result.hash, error: null }
  } catch (e: any) {
    if (
      e?.message?.includes('rejected') ||
      e?.message?.includes('cancelled')
    ) {
      throw new UserRejectedError()
    }
    const msg = parseHorizonError(e)
    return { success: false, hash: null, error: msg }
  }
}
