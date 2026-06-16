import { rpc as SorobanRpc } from '@stellar/stellar-sdk'
import type { ContractEvent } from '@/types'

const RPC = new SorobanRpc.Server('https://soroban-testnet.stellar.org')

/**
 * Poll Soroban RPC for contract events across multiple contract IDs.
 * Returns an unsubscribe / cleanup function.
 */
export function subscribeToEvents(
  contractIds: string[],
  onEvent: (event: ContractEvent) => void,
  intervalMs = 5000
): () => void {
  let lastLedger = 0
  let stopped = false

  const poll = async () => {
    if (stopped) return
    try {
      const latest = await RPC.getLatestLedger()
      const start = lastLedger > 0 ? lastLedger : Math.max(1, latest.sequence - 100)

      const result = await RPC.getEvents({
        startLedger: start,
        filters: contractIds.map((id) => ({
          type: 'contract' as const,
          contractIds: [id],
        })),
      })

      lastLedger = latest.sequence

      result.events.forEach((raw: any) => {
        // Parse topic[0] as event type string
        let eventType = 'EVENT'
        try {
          const topicVal = raw.topic?.[0]
          if (topicVal) {
            const str = topicVal.toString()
            const match = str.match(/\(([^)]+)\)/)
            eventType = match ? match[1].toUpperCase() : str.toUpperCase()
          }
        } catch {
          // keep default
        }

        // Label by which contract emitted it
        let contractLabel = 'CONTRACT'
        const cid: string = raw.contractId || ''
        if (cid === contractIds[0]) contractLabel = 'COUNTER'
        else if (contractIds[1] && cid === contractIds[1]) contractLabel = 'REWARD'
        else if (contractIds[2] && cid === contractIds[2]) contractLabel = 'SPLITTER'

        onEvent({
          id: raw.id || `${Date.now()}-${Math.random()}`,
          type: `${contractLabel}:${eventType}`,
          value: raw.value?.toString() || '',
          timestamp: new Date(),
          txHash: raw.txHash || '',
        })
      })
    } catch (e) {
      console.warn('[EventStream] poll error:', e)
    }
  }

  poll()
  const interval = setInterval(poll, intervalMs)

  return () => {
    stopped = true
    clearInterval(interval)
  }
}
