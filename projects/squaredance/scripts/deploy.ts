import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with address:", deployer.address);

    const Diamond = await ethers.getContractFactory("CapTableDiamond");
    const diamond = await Diamond.deploy(deployer.address, ethers.ZeroAddress);
    await diamond.waitForDeployment();
    console.log("Diamond deployed at:", await diamond.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});