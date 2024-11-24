import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// import { SUPPORTED_NETWORKS } from "../helpers/deploy/constants";
// import { getAcmAdminAccount } from "../helpers/deploy/deploymentUtils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();


  const acmDeployment = await deploy("GovernorBravoDelegate", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });



};

func.tags = ["Governor"];

export default func;
