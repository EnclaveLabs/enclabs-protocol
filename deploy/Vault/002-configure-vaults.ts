import { ethers, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";


interface AdminAccounts {
  [key: string]: string;
}

interface Config {
  [key: string]: number;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const isTimeBased = true; // configure this value if time based deployment

  const blocksPerYear: Config = {
  
    arbitrumone: 0, // time based deployment
  };

  const adminAccount: AdminAccounts = {
   
    arbitrumone: "0x705A1AC9c9e57cc78993Ab8c0C8AAeb75657e02a", // Tofix deployer butshould be timelock
  
    
    hardhat: deployer,
  };

  const accessControlManager = await ethers.getContract("AccessControlManager");

  const ecl = await ethers.getContract("ECL");
  const eclVaultProxyDeployment = await ethers.getContract("ECLVaultProxy");
  const eclStoreDeployment = await ethers.getContract("ECLStore");

  let eclVault = await ethers.getContract("ECLVaultProxy_Implementation");
  await eclVaultProxyDeployment._setPendingImplementation(eclVault.address);
  await eclVault._become(eclVaultProxyDeployment.address);

   eclVault = await ethers.getContractAt("ECLVault", eclVaultProxyDeployment.address);

  let txn = await eclVault.initializeTimeManager(isTimeBased, blocksPerYear[network.name]);
  await txn.wait();

  txn = await eclVault.setEclStore(ecl.address, eclStoreDeployment.address);
  await txn.wait();

  txn = await eclVault.setAccessControl(accessControlManager.address);
  await txn.wait();

  await eclStoreDeployment.setNewOwner(eclVaultProxyDeployment.address);

  if (!hre.network.live) {
    const tx = await accessControlManager.giveCallPermission(
      ethers.constants.AddressZero,
      "add(address,uint256,address,uint256,uint256)",
      deployer,
    );
    await tx.wait();

    // Add token pool to ecl vault
    const allocPoint = 100;
    const token = ecl.address;
    const rewardToken = ecl.address;
    const rewardPerBlock = "61805555555555555";
    const lockPeriod = 3600;

    await eclVault.add(rewardToken, allocPoint, token, rewardPerBlock, lockPeriod);
  } else {
    const owner = adminAccount[hre.network.name];
    console.log("Please accept ownership of vault and store");
    txn = await eclVaultProxyDeployment._setPendingAdmin(owner);
    await txn.wait();

    txn = await eclStoreDeployment.setPendingAdmin(owner);
    await txn.wait();

//TOFIX should be timelock
    const tx = await accessControlManager.giveCallPermission(
        ethers.constants.AddressZero,
        "add(address,uint256,address,uint256,uint256)",
        deployer,
      );
      await tx.wait();
  
      // Add token pool to ecl vault
      const allocPoint = 100;
      const token = ecl.address;
      const rewardToken = ecl.address;
      const rewardPerBlock = "61805555555555555";
      const lockPeriod = 3600;
  
      await eclVault.add(rewardToken, allocPoint, token, rewardPerBlock, lockPeriod);

  }
};

func.tags = ["ecl-vault2"];
func.id = "ecl_vault_configuration"; // id required to prevent re-execution

export default func;