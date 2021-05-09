// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

contract Insurance {
    
    address owner;
    
    event ReturnHash(string hash);
    
    constructor() {                  
        owner = msg.sender;
    }   
    
    modifier _ownerOnly() {
      require(msg.sender == owner);
      _;
    }
    
    function saveHash(string memory _hash) _ownerOnly public {
        emit ReturnHash(_hash);
    }
}