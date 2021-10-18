import './env.js'

import BlocknativeSdk from 'bnc-sdk'
import WebSocket from 'ws'
import { ethers } from 'ethers'
import { mint } from './wallet.js'

function handleTx({ transaction }) {
    if (transaction.to !== process.env.CONTRACT_ADDRESS) {
        console.log("no op, transaction not targeting contract address")
    }

    const method = ethers.utils.hexDataSlice(transaction.input, 0, 4)
    const param = ethers.utils.hexDataSlice(transaction.input, 4)

    if (method == 0xc4e37095) { // This is the method address for the setSaleState
        if (param == 0x1) {
            if (transaction.status == 'pending') {
                mint(transaction)
            }
        } else {
            console.log('Minting is shutting down, do nothing.')
        }
    } else {
        console.log('Not calling the set sale state method, do nothing')
    }

}

function main() {
    // create options object
    const options = {
        dappId: process.env.BN_API_KEY,
        networkId: parseInt(process.env.CHAIN_ID),
        transactionHandlers: [event => handleTx(event)],
        ws: WebSocket, 
        onerror: (error) => {console.log(error)}
    }
    
    // initialize and connect to the api
    const blocknative = new BlocknativeSdk(options)

    // call with the address of the account that you would like to receive status updates for
    const {
        emitter, // emitter object to listen for status updates
        details // initial account details which are useful for internal tracking: address
    } = blocknative.account(process.env.OWNER_ADDRESS)
}

// We are relying on the nonce not changing in order to ensure we don't waste a ton of gas
// Since providers try to restart when a process dies we need to make sure the process doesn't die
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
  });

main()