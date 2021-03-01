// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

contract Insurance {
    
    string[] hashList;
    
    function addHash(string calldata _hash) external {
        hashList.push(_hash);
    }
    
    function getHashList() external view returns(string[] memory) {
        return hashList;
    }
}