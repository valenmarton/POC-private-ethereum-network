import Web3 from 'web3'
import solc from 'solc'
import fs from 'fs'

const url = 'https://goerli.infura.io/v3/e5ea30d98af54c17b3d151ef3b9f62d8'
const web3 = new Web3(url)

let walletAddress = '0x80BE949495682F364De483C541e8BAe64C66361D'

// add wallet private key to authenticate transaction for test network
web3.eth.accounts.wallet.add('ddc571253330f63da878a4825c85d8278f00663f092ed088b6b23c33eba256ee')

//deployed contract on goerli
let deployedContractAddress = '0xf5e32488ce3cae656b38dd2E869090409673fbfc'
let txHash = '0xd20d90f0b319b34a5bdb0eb0c1f0f3523133b921034debb24f829229022850be'

const contract = compileContract()
/* web3.eth.getAccounts().then((accounts) => {
  walletAddress = accounts[0]
  unlockAccountForTransaction()
}) */

//deployContract(contract.abi, contract.bytecode)

let contractObj = new web3.eth.Contract(contract.abi, deployedContractAddress)

const gasPrice = await web3.eth.getGasPrice()
const gasEstimate = await contractObj.methods.addHash('newHash').estimateGas({ from: walletAddress })

contractObj.methods
  .addHash('newHash')
  .send({ from: walletAddress, gasPrice: gasPrice, gas: gasEstimate })
  .then((tx) => {
    console.log(tx)
  })
  .catch((err) => console.log(err))

web3.eth.getTransaction(txHash, (error, tx) => {
  console.log(error)
  console.log(tx)
})

getEventLogs(contractObj)

function unlockAccountForTransaction() {
  let password = '1234'
  web3.eth.personal.unlockAccount(walletAddress, 4 - password, 600).then(() => {
    console.log('Account unlocked')
    deployContract(contract.abi, contract.bytecode)
  })
}

function getEventLogs(contractObj) {
  contractObj
    .getPastEvents('ReturnAddedHash', {
      fromBlock: 0,
      toBlock: 'latest',
    })
    .then(function (events) {
      console.log('Events :', events) // same results as the optional callback above
      console.log('Returned hashes: ')
      events.forEach((event) => {
        console.log(event.returnValues.hash)
      })
    })
}

function deployContract(abi, bytecode) {
  let contract = new web3.eth.Contract(abi)
  let payload = {
    data: bytecode,
  }
  let parameter = {
    from: walletAddress,
    gas: web3.utils.toHex(800000),
    gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
  }
  contract
    .deploy(payload)
    .send(parameter)
    .on('transactionHash', function (transactionHash) {
      console.log('Transaction Hash :', transactionHash)
    })
    .on('receipt', function (receipt) {
      console.log(receipt.contractAddress) // contains the new contract address
    })
    .on('error', function (error) {
      console.log('Error during deployment') // contains the new contract address
    })
    .on('confirmation', () => {})
    .then((newContractInstance) => {
      console.log('Deployed Contract Address :', newContractInstance)
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
