import './env.js'
import { ethers } from "ethers";
import abi from './abi.js'

const COUNT_TO_MINT = 2
const COST_PER_MINT_WEI = ethers.utils.parseEther('.123')

// Also just use an account that has no more than the max you'd be willing to pay since there are likely bugs here
const MAX_I_WANT_TO_PAY_IN_GAS = ethers.utils.parseEther('.1')

// I had issues with infura so using alchemy for now.
let infura = new ethers.providers.InfuraProvider(process.env.CHAIN, process.env.INFURA_PROJECT_ID)
let alchemy = new ethers.providers.AlchemyProvider(process.env.CHAIN, process.env.ALCHEMY_PROJECT_ID)
let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, alchemy)

// nonce is really important here. The nonce is included in a transaction and can only be used once. In order to avoid sending multiple transactions
// and burning gas, we are going to always use the same nonce. This means that a process can only ever get a single transaction confirmed.
let nonce = await alchemy.getTransactionCount(wallet.address);

let doodlesContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, alchemy).connect(wallet);

export async function mint({ maxPriorityFeePerGas, maxFeePerGas }) {
    console.log(`maxFeePerGas ${maxFeePerGas}`)
    console.log(`maxPriorityFeePerGas ${maxPriorityFeePerGas}`)

    // Setup new priority and gas fees. Priority fee is the key here. We want our transaction to be included immediately behind the given transaction
    const newMaxFeePerGas = Math.min(MAX_I_WANT_TO_PAY_IN_GAS, ethers.BigNumber.from(maxFeePerGas.toString()).mul(2)); // I think there's a bug here. Is this per gas or total?
    const newMaxPriorityFeePerGas = ethers.BigNumber.from(maxPriorityFeePerGas.toString()).sub(1);

    console.log(`newMaxFeePerGas ${newMaxFeePerGas}`)
    console.log(`newMaxPriorityFeePerGas ${newMaxPriorityFeePerGas}`)
    const overrides = {
        value: (COUNT_TO_MINT * COST_PER_MINT_WEI).toString(), // need to convert to string here otherwise BigNumber will overflow
        gasLimit: 700000,
        maxPriorityFeePerGas: newMaxPriorityFeePerGas,
        maxFeePerGas: newMaxFeePerGas,
        nonce: nonce
    }
    console.log(overrides)
    const tx = await doodlesContract.mint(COUNT_TO_MINT, overrides)
    console.log(tx)
    console.log("MINT IS OPEN AND TRANSACTION IS SENT!")
    await tx.wait()
    console.log(tx)
}

console.log(nonce)