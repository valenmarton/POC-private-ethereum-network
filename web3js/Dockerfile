FROM alpine:3.13.2

RUN apk --update add geth

COPY datadir2 ./blockchain/chaindata

WORKDIR /blockchain

RUN echo 1234 > account_pwd

CMD geth --nousb --networkid 1114 --rpc --rpcaddr "0.0.0.0" --port 30304 --rpcvhosts="*" --rpccorsdomain="*" --rpcapi web3,eth,debug,personal,net --allow-insecure-unlock --datadir ./datadir2 --mine --miner.threads=2 console