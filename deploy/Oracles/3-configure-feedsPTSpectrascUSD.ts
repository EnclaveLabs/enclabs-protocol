import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Oracles, assets, getOraclesData, ADDRESSES } from "../../helpers/deploymentConfigOracle";


const func: DeployFunction = async function ({ network, deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const resilientOracle = await hre.ethers.getContract("ResilientOracle");
  const spectraOracle = await hre.ethers.getContract("SpectrawstscUSDJune3025Oracle");

  const oraclesData: Oracles = await getOraclesData();
 
  
  const { PT_sw_wstscUSD_june_30_25  } = ADDRESSES[network.name];
 
    console.log(`Configuring resilient oracle for PTscUSD`);
    let tx = await resilientOracle.setTokenConfig({
      asset: PT_sw_wstscUSD_june_30_25,
      oracles: [spectraOracle.address, '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'],
      enableFlagsForOracles: [true, false, false],
    });

    await tx.wait(1);

};

export default func;
func.tags = ["configure-PTSpectrascUSD"];
