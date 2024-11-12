// SPDX-License-Identifier: BSD-3-Clause
pragma solidity 0.8.25;

interface IStaderStakeManager {
    function convertBnbXToBnb(uint256 _amount) external view returns (uint256);
}
