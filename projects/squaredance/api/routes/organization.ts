import express from 'express';
import { ethers } from 'ethers';
import * as fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, adminAddress, initialShares } = req.body;
    try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const signer = await provider.getSigner();

        const diamondArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../../artifacts/contracts/CapTableDiamond.sol/CapTableDiamond.json'), 'utf8'));
        const adminFacetArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../../artifacts/contracts/facets/AdminFacet.sol/AdminFacet.json'), 'utf8'));

        const diamondFactory = new ethers.ContractFactory(diamondArtifact.abi, diamondArtifact.bytecode, signer);
        const diamond = await diamondFactory.deploy(adminAddress, ethers.ZeroAddress);
        await diamond.waitForDeployment();

        const diamondAddress = await diamond.getAddress();
        console.log(`Diamond deployed at: ${diamondAddress}`);

        const adminFacet = new ethers.Contract(diamondAddress, adminFacetArtifact.abi, signer);
        const tx = await adminFacet.createOrganization(name, initialShares);
        await tx.wait();

        res.status(201).json({ message: `Organization ${name} created`, contract: diamondAddress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create organization' });
    }
});

export default router;