import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ADDRESSES } from "../../helpers/deploymentConfigOracle";

const func: DeployFunction = async function ({ getNamedAccounts, deployments, network }: HardhatRuntimeEnvironment) {
  const { deploy, catchUnknownSigner } = deployments;
  const { deployer } = await getNamedAccounts();

  const { vBNBAddress } = ADDRESSES[network.name];
  const { VAIAddress } = ADDRESSES[network.name];

  const proxyOwnerAddress = network.live ? ADDRESSES[network.name].timelock : deployer;
  const boundValidator = await hre.ethers.getContract("BoundValidator");

  const defaultProxyAdmin = await hre.artifacts.readArtifact(
    "hardhat-deploy/solc_0.8/openzeppelin/proxy/transparent/ProxyAdmin.sol:ProxyAdmin",
  );

  await catchUnknownSigner(
    deploy("ResilientOracle", {
      from: deployer,
      log: true,
      deterministicDeployment: false,
      args: [vBNBAddress, VAIAddress, boundValidator.address],
      proxy: {
        owner: proxyOwnerAddress,
        proxyContract: "OptimizedTransparentUpgradeableProxy",
        viaAdminContract: {
          name: "DefaultProxyAdmin",
          artifact: defaultProxyAdmin,
        },
      },
    }),
  );
};

export default func;
func.tags = ["update-resilientOracle"];
func.skip = async env => !env.network.live;
