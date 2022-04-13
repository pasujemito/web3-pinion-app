// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract PinionApp {
    uint256 totalLikes;
    uint256 private seed;

    event SetLike(address indexed from, uint256 timestamp, string message);

    struct User {
        address user;
        string message;
        uint256 timestamp;
    }

    User[] userList;

    mapping(address => uint256) public lastLikedAt;

    constructor() payable {
        console.log("Welcome to PinionApp!");

        // initialise seed of randomness
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function like(string memory _message) public {
        require(
            lastLikedAt[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15min"
        );

        lastLikedAt[msg.sender] = block.timestamp;

        totalLikes += 1;
        console.log("User %s pinioned: %s", msg.sender, _message);

        userList.push(User(msg.sender, _message, block.timestamp));

        // Generate new Seed for next user
        seed = (block.timestamp + block.difficulty + seed) % 100;
        console.log("Random generated seed: %d", seed);

        if (seed <= 50) {
            console.log("%s won!", msg.sender);

            uint256 giftAmount = 0.00001 ether;
            require(
                giftAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: giftAmount}("");
            require(success, "Failed to withdraw eth from contract!");
        }
        emit SetLike(msg.sender, block.timestamp, _message);
    }

    function getAllUsers() public view returns (User[] memory) {
        return userList;
    }

    function getTotalLikes() public view returns (uint256) {
        return totalLikes;
    }
}
