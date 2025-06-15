import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import {FunctionFragment} from "ethers";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying as:", deployer.address);

    // Step 1: Deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.waitForDeployment();
    const diamondCutFacetAddress = await diamondCutFacet.getAddress();
    console.log("DiamondCutFacet deployed at:", diamondCutFacetAddress);

    // Step 2: Deploy CapTableDiamond
    const Diamond = await ethers.getContractFactory("CapTableDiamond");
    const diamond = await Diamond.deploy(deployer.address, diamondCutFacetAddress);
    await diamond.waitForDeployment();
    const diamondAddress = await diamond.getAddress();
    console.log("Diamond deployed at:", diamondAddress);

    // Step 3: Deploy AdminFacet
    const AdminFacet = await ethers.getContractFactory("AdminFacet");
    const adminFacet = await AdminFacet.deploy();
    await adminFacet.waitForDeployment();
    const adminFacetAddress = await adminFacet.getAddress();
    console.log("AdminFacet deployed at:", adminFacetAddress);

    // Step 4: Call diamondCut to add AdminFacet
    const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);

    const iface = AdminFacet.interface;
    const selectors = iface.fragments
        .filter((f): f is FunctionFragment => f.type === 'function')
        .map((f) => iface.getFunction(f.name)?.selector);
    console.log("AdminFacet selectors:", selectors);

    const cut = [{
        facetAddress: adminFacetAddress,
        action: 0, // FacetCutAction.Add
        functionSelectors: selectors
    }];

    const tx = await diamondCut.diamondCut(cut, ethers.ZeroAddress, "0x");
    await tx.wait();
    console.log("AdminFacet added via diamondCut.");
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});