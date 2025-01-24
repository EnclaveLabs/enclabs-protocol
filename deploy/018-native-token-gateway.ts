import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { contracts as ilSonic } from "../deployments/sonic.json";
import { contracts as ilArbOne } from "../deployments/arbitrumone.json";
import { contracts as ilArbSepolia } from "../deployments/arbitrumsepolia.json";
import { contracts as ilBscMainnet } from "../deployments/bscmainnet.json";
import { contracts as ilBscTestnet } from "../deployments/bsctestnet.json";
import { contracts as ilEthereum } from "../deployments/ethereum.json";
import { contracts as ilOpbnbMainnet } from "../deployments/opbnbmainnet.json";
import { contracts as ilOpbnbTestnet } from "../deployments/opbnbtestnet.json";
import { contracts as ilOpSepolia } from "../deployments/opsepolia.json";
import { contracts as ilSepolia } from "../deployments/sepolia.json";
import { contracts as ilZkMainnet } from "../deployments/zksyncmainnet.json";
import { contracts as ilZkSepolia } from "../deployments/zksyncsepolia.json";
import { getConfig } from "../helpers/deploymentConfig";

interface VTokenConfig {
  name: string;
  address: string;
}

const VWNativeInfo: { [key: string]: VTokenConfig[] } = {
  sonic: [
    {
      name: "vwS_Core",
      address: "0xc96a4cd13C8fCB9886DE0CdF7152B9F930D67E96",
    },
    {
      name: "vwS_LiquidStakedS",
      address: "0x876e062420fB9a4861968EC2E0FF91be88142343",
    },
  ],
  
  // arbitrumone: [
  //   {
  //     name: "vWETH_Core",
  //     address: ilArbOne.VToken_vWETH_Core.address,
  //   },
  //   {
  //     name: "vWETH_LiquidStakedETH",
  //     address: ilArbOne.VToken_vWETH_LiquidStakedETH.address,
  //   },
  // ],
  
};

const getVWNativeTokens = (networkName: string): VTokenConfig[] => {
  const vTokensInfo = VWNativeInfo[networkName];
  if (vTokensInfo === undefined) {
    throw new Error(`config for network ${networkName} is not available.`);
  }

  return vTokensInfo;
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { preconfiguredAddresses } = await getConfig(hre.network.name);

  const vWNativesInfo = getVWNativeTokens(hre.network.name);
  for (const vWNativeInfo of vWNativesInfo) {
    await deploy(`NativeTokenGateway_${vWNativeInfo.name}`, {
      contract: "NativeTokenGateway",
      from: deployer,
      args: [vWNativeInfo.address],
      log: true,
      autoMine: true,
      skipIfAlreadyDeployed: true,
    });

    const nativeTokenGateway = await ethers.getContract(`NativeTokenGateway_${vWNativeInfo.name}`);
    const targetOwner = preconfiguredAddresses.NormalTimelock || deployer;
    if (hre.network.live) {
      const tx = await nativeTokenGateway.transferOwnership(targetOwner);
      await tx.wait();
      console.log(`Transferred ownership of NativeTokenGateway_${vWNativeInfo.name} to Timelock`);
    }
  }
};

func.tags = ["NativeTokenGateway"];

func.skip = async (hre: HardhatRuntimeEnvironment) => !hre.network.live;

export default func;
