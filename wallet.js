import './env.js'
import { ethers } from "ethers";
import abi from './abi.js'

const COUNT_TO_MINT = 5
const COST_PER_MINT_WEI = ethers.utils.parseEther('.123')

// Also just use an account that has no more than the max you'd be willing to pay since there are likely bugs here
const MAX_I_WANT_TO_PAY_IN_GAS = ethers.utils.parseEther('.2')
const GAS_LIMIT = 700000
const MAX_FEE = MAX_I_WANT_TO_PAY_IN_GAS.div(GAS_LIMIT)

// I had issues with infura so using alchemy for now.
let infura = new ethers.providers.InfuraProvider(process.env.CHAIN, process.env.INFURA_PROJECT_ID)
let alchemy = new ethers.providers.AlchemyProvider(process.env.CHAIN, process.env.ALCHEMY_PROJECT_ID)
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, alchemy)

// nonce is really important here. The nonce is included in a transaction and can only be used once. In order to avoid sending multiple transactions
// and burning gas, we are going to always use the same nonce. This means that a process can only ever get a single transaction confirmed.
let nonce = await alchemy.getTransactionCount(wallet.address);

let doodlesContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, alchemy).connect(wallet);

export async function mint(maxPriorityFeePerGas) {
    // Setup new priority fees. Priority fee is the key here. We want our transaction to be included immediately behind the given transaction
    const newMaxPriorityFeePerGas = ethers.BigNumber.from(maxPriorityFeePerGas.toString()).sub(1);

    const overrides = {
        value: (COUNT_TO_MINT * COST_PER_MINT_WEI).toString(), // need to convert to string here otherwise BigNumber will overflow
        gasLimit: GAS_LIMIT,
        maxPriorityFeePerGas: newMaxPriorityFeePerGas,
        maxFeePerGas: MAX_FEE,
        nonce: nonce
    }
    console.log(overrides)
    const tx = await doodlesContract.mint(COUNT_TO_MINT, overrides)
    console.log(tx)
    console.log("MINT IS OPEN AND TRANSACTION IS SENT!")
    await tx.wait()
    console.log(tx)
}
