# Build and run the private ethereum #

`docker-compose build`

`docker-compose run -p 8545:8545 -p 30303:30303 blockchain`

`exit` on stdin to quit shutdown the process gracefully

Starts mining with 2 threads, RPC port is forwarded for HTTP communication (:8545)

---

## Using web3js client for RPC connection ##

`npm install`

`npm start` (deploys smart contract on the blockchain)
