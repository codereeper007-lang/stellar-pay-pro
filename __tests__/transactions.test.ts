import {
  WalletNotFoundError,
  UserRejectedError,
  InsufficientBalanceError,
  parseHorizonError
} from '@/lib/errors'

describe('Error classes', () => {
  it('WalletNotFoundError has correct name and message', () => {
    const e = new WalletNotFoundError('Freighter')
    expect(e.name).toBe('WalletNotFoundError')
    expect(e.message).toContain('Freighter')
  })

  it('UserRejectedError has correct name', () => {
    const e = new UserRejectedError()
    expect(e.name).toBe('UserRejectedError')
  })

  it('InsufficientBalanceError contains both amounts', () => {
    const e = new InsufficientBalanceError('5.0000', '10.0000')
    expect(e.message).toContain('5.0000')
    expect(e.message).toContain('10.0000')
  })
})

describe('parseHorizonError', () => {
  it('returns readable message for op_underfunded', () => {
    const e = { response: { data: { extras: {
      result_codes: { operations: ['op_underfunded'] }
    }}}}
    expect(parseHorizonError(e)).toContain('Insufficient')
  })

  it('returns readable message for op_no_destination', () => {
    const e = { response: { data: { extras: {
      result_codes: { operations: ['op_no_destination'] }
    }}}}
    expect(parseHorizonError(e)).toContain('Destination')
  })

  it('falls back to error message', () => {
    expect(parseHorizonError({ message: 'timeout' })).toBe('timeout')
  })
})
