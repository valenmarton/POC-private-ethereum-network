FROM alpine:3.13.2

RUN apk --update add geth

COPY ./data ./blockchain/data

WORKDIR /blockchain

RUN echo 1234 > account_pwd

CMD geth --nousb --networkid 1114 --rpc --rpcaddr "0.0.0.0" --rpcvhosts="*" --rpccorsdomain="*" --rpcapi web3,eth,debug,personal,net --allow-insecure-unlock --unlock 0xA042C7E95F0393db17203aEa0Fc7bDF092E30A4c --password account_pwd --datadir ./data --mine --miner.threads=2 console