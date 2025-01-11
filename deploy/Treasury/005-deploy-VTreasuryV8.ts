import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";


interface AdminAccounts {
  [key: string]: string;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const getTimelock = async () => {
    switch (hre.network.name) {
      case "bsctestnet":
      case "bscmainnet": {
        const timelock = await deployments.get("NormalTimelock");
        return timelock.address;
      }
    }
    return "";
  };

  const acmAdminAccount: AdminAccounts = {
   
    arbitrumone: "0x705A1AC9c9e57cc78993Ab8c0C8AAeb75657e02a", // deployer tofix multisig
   
    sonic: deployer,
  };

  const deployerSigner = await hre.ethers.getSigner(deployer);

  const treasuryInstance = await deploy("VTreasuryV8", {
    contract: "VTreasuryV8",
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
  });

  const adminAccount: string = acmAdminAccount[hre.network.name];

  const VTreasuryV8 = await ethers.getContractAt("VTreasuryV8", treasuryInstance.address);

  if ((await VTreasuryV8.owner()).toLowerCase() != adminAccount.toLowerCase()) {
    console.log("Transferring owner to venus admin account");
    const tx = await VTreasuryV8.connect(deployerSigner).transferOwnership(adminAccount);
    tx.wait();
    console.log("Ownership Transferred to: ", await VTreasuryV8.pendingOwner());
  }
};

func.tags = ["VTreasuryV8"];


export default func;