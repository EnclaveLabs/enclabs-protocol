import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getConfig } from "../../helpers/deploymentConfig";
import { toAddress } from "../../helpers/deploymentUtils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { preconfiguredAddresses } = await getConfig(hre.network.name);
  const accessControlManagerAddress = await toAddress(
    preconfiguredAddresses.AccessControlManager || "AccessControlManager",
    hre,
  );
  const proxyOwnerAddress = await toAddress(preconfiguredAddresses.NormalTimelock || "account:deployer", hre);

  // The reason for this is that the contracts `OptimizedTransparentUpgradeableProxy` and `DefaultProxyAdmin` that the hardhat-deploy
  // plugin fetches from the artifact is not zk compatible causing the deployments to fail. So we bought it one level up to our repo,
  // added them to compile using zksync compiler. It is compatible for all networks.
  const defaultProxyAdmin = await hre.artifacts.readArtifact(
    "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
  );

  const eclVaultAddress = await toAddress(preconfiguredAddresses.EclVault || "ECLVaultProxy", hre);
  const proposalConfigs = [
    {
      votingDelay: 1,
      votingPeriod: 3600,
      proposalThreshold: BigInt(200000e18),
    },
    {
      votingDelay: 1,
      votingPeriod: 20800,
      proposalThreshold: BigInt(200000e18),
    },
    {
      votingDelay: 1,
      votingPeriod: 7200,
      proposalThreshold: BigInt(200000e18),
    },
  ];
  const timelocks = [
    "0x29C07c3fc39801FF93851B100D2C0c440c459035",
    "0x78d7016dec8d704109ab1b5E00255a7bCa3b9Ff0",
    "0x29C07c3fc39801FF93851B100D2C0c440c459035"
    
  ];
  const guardianAddress = await toAddress(preconfiguredAddresses.GuardianMultisig || "account:deployer", hre);
  

  await deploy("GovernorBravo", {
    from: deployer,
    contract: "GovernorBravoDelegate",
    proxy: {
      owner: proxyOwnerAddress,
      proxyContract: "OptimizedTransparentUpgradeableProxy",
      execute: {
        methodName: "initialize",
        args: [eclVaultAddress, proposalConfigs, timelocks, guardianAddress],
      },
      viaAdminContract: {
        name: "DefaultProxyAdmin",
        artifact: defaultProxyAdmin,
      },
      upgradeIndex: 0,
    },
    autoMine: true,
    log: true,
    skipIfAlreadyDeployed: true,
  });
};

func.tags = ["Governor", "il"];

export default func;
