// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.25;

/**
 * @title IRiskFund
 * @author Enclabs
 * @notice Interface implemented by `RiskFund`.
 */
interface IRiskFund {
    function transferReserveForAuction(address comptroller, uint256 amount) external returns (uint256);

    function convertibleBaseAsset() external view returns (address);

    function getPoolsBaseAssetReserves(address comptroller) external view returns (uint256);
}
