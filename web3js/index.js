import Web3 from 'web3'
import solc from 'solc'
import fs from 'fs'
import shortHash from 'short-hash'
import zlib from 'zlib'
import shorter from 'shorter'
import sha256 from 'sha256'

console.log(sha256('asd'))

const url = 'https://goerli.infura.io/v3/e5ea30d98af54c17b3d151ef3b9f62d8'
const web3 = new Web3(new Web3.providers.HttpProvider(url))

console.log('ascii', web3.utils.hexToAscii('0x414c4c2d39393831333231000000000000000000000000000000000000000000'))

let walletAddress = '0x80BE949495682F364De483C541e8BAe64C66361D'
console.log('wA', walletAddress)
console.log('wA', { walletAddress })

// add wallet private key to authenticate transaction for test network
web3.eth.accounts.wallet.add('ddc571253330f63da878a4825c85d8278f00663f092ed088b6b23c33eba256ee')

//deployed contract on goerli
let deployedContractAddress = '0xd29b00b298da53ba01682191a6199e8c34b79c14'
let txHash = '0xea00adee4dcba38a5ef8f4e8d4e4f3ce445f4a488d701ec4386dd1b7d65d68c6'

const contract = compileContract()
/* web3.eth.getAccounts().then((accounts) => {
  walletAddress = accounts[0]
  unlockAccountForTransaction()
}) */

try {
  await deploy(contract.abi, contract.bytecode)
} catch (e) {
  console.log(e)
}

let contractObj = new web3.eth.Contract(contract.abi, deployedContractAddress)

let jsonData = JSON.stringify({
  insurance_number: 'ALL-123131',
  insured_name: 'Biztosított Balázs',
  bank_name: 'Budapest Bank',
  bank_account_number: '12300012-12120000-00000000',
  compensation: '30000',
  currency: 'HUF',
  contract_date: '2021-03-26T14:01:00+01:00',
  start_date: '2021-03-27T00:00:00+01:00',
  end_date: '2021-04-10T23:59:59+01:00',
  flight_number: 'CZ4289',
  flight_date: '2021-04-09T08:40:00+00:00',
})

let hashInBytes = web3.utils.fromAscii('c6670470b32ecd57d52d64314edee0a083eb75e1fc1417c3a8eff4c7793ca17c')
//console.log('hashInBytes:', hashInBytes)

const gasPrice = await web3.eth.getGasPrice()
const gasEstimate = await contractObj.methods.saveHash(hashInBytes).estimateGas({ from: walletAddress })

async function addHash() {
  return await contractObj.methods
    .saveHash(hashInBytes)
    .send({ from: walletAddress, gasPrice: gasPrice, gas: gasEstimate })
    .then((tx) => {
      return tx
    })
    .catch((err) => console.log(err))
}

//const tx = await addHash()
console.log('hash added', tx)
console.log('txEventHash', tx.events.ReturnHash.returnValues.hash)
console.log(web3.utils.hexToAscii(tx.events.ReturnHash.returnValues.hash))

/* web3.eth.getTransaction(txHash, (error, tx) => {
  console.log(error)
  console.log(tx)
}) */
//getEventLogs(contractObj)

function getEventLogs(contractObj) {
  contractObj
    .getPastEvents('ReturnAddedHash', {
      fromBlock: 0,
      toBlock: 'latest',
    })
    .then((events) => {
      console.log('Events :', events) // same results as the optional callback above
      console.log('Returned hashes: ')
      events.forEach((event) => {
        console.log(web3.utils.hexToAscii(event.returnValues.hash))
      })
    })
    .catch((error) => {
      console.log(error)
    })
}

function unlockAccountForTransaction() {
  let password = '1234'
  web3.eth.personal.unlockAccount(walletAddress, 4 - password, 600).then(() => {
    console.log('Account unlocked')
  })
}

async function deploy(abi, byteCode) {
  let contract = new web3.eth.Contract(abi)
  let deployOptions = { data: byteCode }
  let sendOptions = { from: walletAddress, gas: 800000 }
  return await contract
    .deploy(deployOptions)
    .send(sendOptions)
    .on('transactionHash', function (transactionHash) {})
    .on('receipt', function (receipt) {
      console.log(receipt)
    })
    .on('error', function (e) {
      console.log(e)
      return e
    })
}

function deployContract(abi, bytecode) {
  console.log('Deploying contract')
  let contract = new web3.eth.Contract(abi)
  let payload = {
    data: bytecode,
  }
  let parameter = {
    from: walletAddress,
    gas: 500000,
  }
  contract
    .deploy(payload)
    .send(parameter)
    .on('transactionHash', function (transactionHash) {
      console.log('Transaction Hash :', transactionHash)
    })
    .on('receipt', function (receipt) {
      console.log(receipt) // contains the new contract address
    })
    .on('error', function (error) {
      console.log(error) // contains the new contract address
    })
    .on('confirmation', () => {})
    .then((newContractInstance) => {
      //console.log('Deployed Contract Address :', newContractInstance)
    })
    .catch((error) => {
      console.log(error)
    })
}

function compileContract() {
  const input = {
    language: 'Solidity',
    sources: {
      OnlyHashContract: {
        content: fs.readFileSync('OnlyHashContract.sol', 'utf8'),
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  }

  const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)))
  let contract = compiledContract.contracts['OnlyHashContract'].Insurance

  return {
    insurance: contract,
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  }
}
