import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ADDRESSES } from "../../helpers/deploymentConfigOracle";

const func: DeployFunction = async ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const proxyOwnerAddress = network.live ? ADDRESSES[network.name].timelock : deployer;

  await deploy("MockSfrxEthFraxOracle", {
    contract: "MockSfrxEthFraxOracle",
    from: deployer,
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
    args: [],
  });

  const mockSfrxEthFraxOracle = await ethers.getContract("MockSfrxEthFraxOracle");

  if ((await mockSfrxEthFraxOracle.owner()) === deployer) {
    await mockSfrxEthFraxOracle.transferOwnership(proxyOwnerAddress);
  }
};

export default func;
func.tags = ["sFraxETHOracle"];
func.skip = async (hre: HardhatRuntimeEnvironment) => hre.network.name !== "sepolia";
