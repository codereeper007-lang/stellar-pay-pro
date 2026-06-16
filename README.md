# StellarPay Pro

StellarPay Pro is a next-generation, mobile-responsive dApp built on the Stellar Testnet. It demonstrates advanced smart contract capabilities, real-time event streaming, and production-ready architecture.

## 🚀 Features & Architecture
- **Production-Ready Architecture:** Built with Next.js 14 (App Router), strict TypeScript, and Tailwind CSS.
- **Mobile Responsive Frontend:** Fluid UI that scales perfectly from desktop to mobile screens using modern glass-morphism aesthetics.
- **Advanced Smart Contract Integration:** Interacts directly with Soroban smart contracts on the Stellar Testnet.
- **Inter-contract Communication:** Features a Payment Splitter contract that routes payments to multiple addresses and interacts with a Reward token contract.
- **Event Streaming:** Real-time on-chain event listening via Horizon and Soroban RPC, displayed in a live Activity Feed.
- **Error Handling:** Robust global toast notifications, graceful fallbacks for unfunded accounts, and detailed loading states (Progress Bars, CSS Spinners).

## 🛠️ Smart Contracts Deployed
The application integrates with the following Soroban smart contracts on the **Stellar Testnet**:

- **Counter Contract:** [`CDSDF3RZZ4TH2X2N4KJDT72P3AF2A4CLCVN3SXOKHUJ22SC7ZQIDQTFC`](https://stellar.expert/explorer/testnet/contract/CDSDF3RZZ4TH2X2N4KJDT72P3AF2A4CLCVN3SXOKHUJ22SC7ZQIDQTFC)
- **Reward Contract:** [`CDIS7IB6CSFWLDEOTGQ6KLGKHKOO4NGZ42HQDUXPE5WANS3VRH3BGLVB`](https://stellar.expert/explorer/testnet/contract/CDIS7IB6CSFWLDEOTGQ6KLGKHKOO4NGZ42HQDUXPE5WANS3VRH3BGLVB)
- **Payment Splitter:** [`CBTMVK7RTG6RHTQF2SDCFHXPDIULZBBIXVELUUFOBJPZJTDOSTBHBKHB`](https://stellar.expert/explorer/testnet/contract/CBTMVK7RTG6RHTQF2SDCFHXPDIULZBBIXVELUUFOBJPZJTDOSTBHBKHB)
- **SDT Token:** [`CAU2U5ZTXVPCO7SJZGLES5444LKTFJ5QRBFVBUED22TUQ2JNU4PSDKWV`](https://stellar.expert/explorer/testnet/contract/CAU2U5ZTXVPCO7SJZGLES5444LKTFJ5QRBFVBUED22TUQ2JNU4PSDKWV)

## ⚙️ CI/CD & Testing
- **CI/CD Pipeline:** Configured via GitHub Actions (`.github/workflows/ci.yml`) to automatically install dependencies, run tests, and execute a production build on every push.
- **Testing:** Comprehensive Jest and React Testing Library suites verifying UI state, transaction builders, and Soroban formatting logic. (3 passing test suites with 16 passing tests).

## 💻 Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access at `http://localhost:3000`

## 📸 App Screenshots

### Wallet Options Available (Wallet Modal)
![Wallet Options Available](./public/screenshots/wallet_options.png)

### Wallet Connected & Dashboard (Balance Displayed)
![Wallet Connected](./public/screenshots/wallet_connected.png)

### Successful Testnet Transaction (Transaction Result)
![Successful Transaction](./public/screenshots/transaction_success.png)

## 🔗 On-Chain Verified Transactions

- **Soroban Contract Call Transaction Hash:** `0f49ab365ef03f9e49a5d5c9ad641fee1f5e0bae31c118e9bd3ac4260fc0b3d9`
  - [View on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/tx/0f49ab365ef03f9e49a5d5c9ad641fee1f5e0bae31c118e9bd3ac4260fc0b3d9)
- **Standard Transaction/Split Fallback Transaction Hash:** `d65eb89559fa1fe44897a5595d3357b2144d4b41b4120327063955b077a1ec66`
  - [View on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/tx/d65eb89559fa1fe44897a5595d3357b2144d4b41b4120327063955b077a1ec66)

## ✅ Submission Checklist Status
- [x] Public GitHub repository
- [x] README with complete documentation
- [x] Minimum 10+ meaningful commits (26 step-by-step commits)
- [x] Live demo link
- [x] Contract deployment address (Listed above)
- [x] Transaction hash for contract interaction (Visible dynamically in the dApp's Activity Feed)
- [x] Mobile responsive UI Screenshot (Added above)
- [x] CI/CD pipeline running Screenshot
- [x] Test output with 3+ passing tests Screenshot
- [x] Demo video link

---
*Built for the Stellar ecosystem.*
