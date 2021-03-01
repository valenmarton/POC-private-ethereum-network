import Web3 from "web3";
import solc from "solc";
import fs from "fs";


const url = "http://localhost:8545";
const web3 = new Web3(url);

let walletAddress = '0xA042C7E95F0393db17203aEa0Fc7bDF092E30A4c';

const contract = compileContract();
/*web3.eth.getAccounts().then((accounts ) => {
  walletAddress = accounts[0];
  unlockAccountForTransaction();
})*/

deployContract(contract.abi, contract.bytecode);
/*function unlockAccountForTransaction() {
  let password = "1234";
  web3.eth.personal.unlockAccount(walletAddress, password, 600).then(() => {
    console.log("Account unlocked");
    deployContract(contract.abi, contract.bytecode);
  });
}*/

function deployContract(abi, bytecode) {
  let contract = new web3.eth.Contract(abi);
  let payload = {
    data: bytecode,
  };
  let parameter = {
    from: walletAddress,
    gas: web3.utils.toHex(800000),
    gasPrice: web3.utils.toHex(web3.utils.toWei("30", "gwei")),
  };
  contract
    .deploy(payload)
    .send(parameter)
    .on("transactionHash", function (transactionHash) {
      console.log("Transaction Hash :", transactionHash);
    })
    .on("receipt", function (receipt) {
      console.log(receipt.contractAddress); // contains the new contract address
    })
    .on("error", function (error) {
      console.log("Error during deployment"); // contains the new contract address
    })
    .on("confirmation", () => {})
    .then((newContractInstance) => {
      console.log("Deployed Contract Address :", newContractInstance);
    })
    .catch((error) => {
      console.log(error);
    });
}

function compileContract() {
  const input = {
    language: "Solidity",
    sources: {
      OnlyHashContract: {
        content: fs.readFileSync("OnlyHashContract.sol", "utf8"),
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
  let contract = compiledContract.contracts["OnlyHashContract"].Insurance;

  return {
    insurance: contract,
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}
