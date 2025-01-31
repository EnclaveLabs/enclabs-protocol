import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ADDRESSES } from  "../../helpers/deploymentConfigOracle";

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  network,
  artifacts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const resilientOracle = await ethers.getContract("ResilientOracle");
  const chainlinkOracle = await ethers.getContract("ChainlinkOracle");
  const proxyOwnerAddress = network.live ? ADDRESSES[network.name].timelock : deployer;
  const defaultProxyAdmin = await artifacts.readArtifact(
    "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
  );
  
  const { scUSD, PT_sw_wstscUSD_june_30_25} = ADDRESSES[network.name];

  
    await deploy("SpectrawstscUSDJune3025Oracle", {
      contract: "SpectraFixedYieldOracle",
      from: deployer,
      log: true,
      deterministicDeployment: false,
      args: [PT_sw_wstscUSD_june_30_25, scUSD, resilientOracle.address, BigNumber.from('200000000000000000')],
      proxy: {
        owner: proxyOwnerAddress,
        proxyContract: "OptimizedTransparentUpgradeableProxy",
        viaAdminContract: {
          name: "DefaultProxyAdmin",
          artifact: defaultProxyAdmin,
        },
      },
      skipIfAlreadyDeployed: true,
    });

   
};

export default func;
func.tags = ["spectra-wstscUSD"];
func.skip = async (hre: HardhatRuntimeEnvironment) => hre.network.name !== "sonic" && hre.network.name !== "sepolia";
