import { getXLMBalance, isValidStellarAddress, fundTestnetAccount } from '@/lib/stellar'

const VALID = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN'
const INVALID = 'not-valid'

jest.mock('@stellar/stellar-sdk', () => {
  const real = jest.requireActual('@stellar/stellar-sdk')
  return {
    ...real,
    StrKey: {
      isValidEd25519PublicKey: jest.fn((key) => key === 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN')
    },
    Horizon: {
      ...real.Horizon,
      Server: jest.fn().mockImplementation(() => ({
        loadAccount: jest.fn().mockImplementation((pk) => {
          if (pk === 'UNFUNDED') {
            throw Object.assign(new Error('not found'), {
              response: { status: 404 }
            })
          }
          return Promise.resolve({
            balances: [
              { asset_type: 'native', balance: '1234.5678900' }
            ]
          })
        })
      }))
    }
  }
})

describe('getXLMBalance', () => {
  it('returns formatted balance for funded account', async () => {
    const b = await getXLMBalance(VALID)
    expect(b).toBe('1234.5679')
  })

  it('returns 0.0000 for unfunded account', async () => {
    const b = await getXLMBalance('UNFUNDED')
    expect(b).toBe('0.0000')
  })
})

describe('isValidStellarAddress', () => {
  it('returns true for valid G address', () => {
    expect(isValidStellarAddress(VALID)).toBe(true)
  })

  it('returns false for invalid address', () => {
    expect(isValidStellarAddress(INVALID)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidStellarAddress('')).toBe(false)
  })
})

describe('fundTestnetAccount', () => {
  beforeEach(() => { global.fetch = jest.fn() })

  it('returns true when friendbot succeeds', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true })
    expect(await fundTestnetAccount(VALID)).toBe(true)
  })

  it('returns false when friendbot fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    expect(await fundTestnetAccount(VALID)).toBe(false)
  })
})
