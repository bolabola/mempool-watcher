import dotenv from 'dotenv'

if (!process.env.CHAIN) {
    console.log('Missing CHAIN environment variable. Exiting.')
    process.exit(1)
}
dotenv.config({ path: `./.env.${process.env.CHAIN}` })
console.log(`Running against ${process.env.CHAIN}`)
