import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ADDRESSES } from  "../../helpers/deploymentConfigOracle";

const func: DeployFunction = async ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const proxyOwnerAddress = network.live ? ADDRESSES[network.name].timelock : deployer;

  await deploy("MockEtherFiLiquidityPool", {
    from: deployer,
    contract: "MockEtherFiLiquidityPool",
    args: [],
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
  });

  const mockEtherFiLiquidityPool = await ethers.getContract("MockEtherFiLiquidityPool");
  await mockEtherFiLiquidityPool.transferOwnership(proxyOwnerAddress);
};

export default func;
func.tags = ["weETH"];
func.skip = async (hre: HardhatRuntimeEnvironment) => hre.network.name !== "sepolia";
