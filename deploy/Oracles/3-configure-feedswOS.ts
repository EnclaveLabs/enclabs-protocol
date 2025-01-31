import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Oracles, assets, getOraclesData, ADDRESSES } from "../../helpers/deploymentConfigOracle";


const func: DeployFunction = async function ({ network, deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const resilientOracle = await hre.ethers.getContract("ResilientOracle");
  const wOSOracle = await hre.ethers.getContract("WOSOracle");

  const oraclesData: Oracles = await getOraclesData();
 
  
  const { wOS, WS } = ADDRESSES[network.name];
 
    console.log(`Configuring resilient oracle for wOS`);
    let tx = await resilientOracle.setTokenConfig({
      asset: wOS,
      oracles: [wOSOracle.address, '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'],
      enableFlagsForOracles: [true, false, false],
    });

    await tx.wait(1);

};

export default func;
func.tags = ["configure-wOS"];
