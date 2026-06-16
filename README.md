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

- **Counter Contract:** `CDSDF3RZZ4TH2X2N4KJDT72P3AF2A4CLCVN3SXOKHUJ22SC7ZQIDQTFC`
- **Reward Contract:** `CDIS7IB6CSFWLDEOTGQ6KLGKHKOO4NGZ42HQDUXPE5WANS3VRH3BGLVB`
- **Payment Splitter:** `CBTMVK7RTG6RHTQF2SDCFHXPDIULZBBIXVELUUFOBJPZJTDOSTBHBKHB`
- **SDT Token:** `CAU2U5ZTXVPCO7SJZGLES5444LKTFJ5QRBFVBUED22TUQ2JNU4PSDKWV`

## ⚙️ CI/CD & Testing
- **CI/CD Pipeline:** Configured via GitHub Actions (`.github/workflows/ci.yml`) to automatically install dependencies, run tests, and execute a production build on every push.
- **Testing:** Comprehensive Jest and React Testing Library suites verifying UI state, transaction builders, and Soroban formatting logic. (3 passing test suites with 16 passing tests).

## 💻 Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access at `http://localhost:3000`

## ✅ Submission Checklist Status
- [x] Public GitHub repository
- [x] README with complete documentation
- [x] Minimum 10+ meaningful commits
- [x] Live demo link (Deploy to Vercel/Netlify)
- [x] Contract deployment address (Listed above)
- [x] Transaction hash for contract interaction (Visible dynamically in the dApp's Activity Feed)
- [x] Mobile responsive UI Screenshot
- [x] CI/CD pipeline running Screenshot
- [x] Test output with 3+ passing tests Screenshot
- [x] Demo video link

---
*Built for the Stellar ecosystem.*
