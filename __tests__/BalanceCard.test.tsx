import { render, screen, fireEvent } from '@testing-library/react'
import { BalanceCard } from '@/components/BalanceCard'

const mockRefresh = jest.fn()

jest.mock('@/context/WalletContext', () => ({
  useWallet: () => ({
    publicKey: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN',
    isConnected: true,
    balance: '1234.5678',
    isLoading: false,
    refreshBalance: mockRefresh,
    network: 'TESTNET'
  })
}))

describe('BalanceCard', () => {
  it('renders the XLM balance', () => {
    render(<BalanceCard />)
    expect(screen.getByText(/1234/)).toBeInTheDocument()
    expect(screen.getByText(/\.5678/)).toBeInTheDocument()
  })

  it('shows TESTNET badge', () => {
    render(<BalanceCard />)
    expect(screen.getByText(/TESTNET/i)).toBeInTheDocument()
  })

  it('calls refreshBalance on button click', () => {
    render(<BalanceCard />)
    // Find the refresh button (it has aria-label="Refresh balance")
    const refreshButton = screen.getByLabelText('Refresh balance')
    fireEvent.click(refreshButton)
    expect(mockRefresh).toHaveBeenCalled()
  })
})
