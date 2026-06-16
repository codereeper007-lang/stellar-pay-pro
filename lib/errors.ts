export class WalletNotFoundError extends Error {
  constructor(walletName: string) {
    super(`${walletName} not found. Please install it first.`)
    this.name = 'WalletNotFoundError'
  }
}

export class UserRejectedError extends Error {
  constructor() {
    super('You cancelled the transaction signing.')
    this.name = 'UserRejectedError'
  }
}

export class InsufficientBalanceError extends Error {
  constructor(available: string, required: string) {
    super(
      `Insufficient balance. Available: ${available} XLM, Required: ${required} XLM`
    )
    this.name = 'InsufficientBalanceError'
  }
}

export function parseHorizonError(error: any): string {
  const codes = error?.response?.data?.extras?.result_codes
  if (!codes) return error?.message || 'Unknown error occurred'
  if (codes.operations?.includes('op_underfunded'))
    return 'Insufficient balance for this transaction.'
  if (codes.operations?.includes('op_no_destination'))
    return 'Destination account does not exist on Stellar network.'
  if (codes.transaction === 'tx_bad_auth')
    return 'Transaction authorization failed.'
  return `Transaction failed: ${JSON.stringify(codes)}`
}
