import dotenv from 'dotenv'

import BlocknativeSdk from 'bnc-sdk'
import WebSocket from 'ws'

function main() {
    if (!process.env.CHAIN) {
        console.log('Missing CHAIN environment variable. Exiting.')
        process.exit(1)
    }
    console.log(`Running against ${process.env.CHAIN}`)
    dotenv.config({ path: `./.env.${process.env.CHAIN}` })


    // create options object
    const options = {
        dappId: process.env.BN_API_KEY,
        networkId: parseInt(process.env.CHAIN_ID),
        transactionHandlers: [event => console.log(event.transaction)],
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
    console.log(details)
}

main()