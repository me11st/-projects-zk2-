import express from 'express';
import { ethers } from 'ethers';

const router = express.Router();
const diamondAddress = process.env.DIAMOND_ADDRESS!;

router.post('/', async (req, res) => {
    const { contributorAddress, amount, encryptedCID } = req.body;
    try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const signer = await provider.getSigner();

        const iface = new ethers.Interface([
            "function issueShares(address to, uint256 amount, string encryptedCID)"
        ]);

        const contract = new ethers.Contract(diamondAddress, iface, signer);
        const tx = await contract.issueShares(contributorAddress, amount, encryptedCID);
        await tx.wait();

        res.status(200).json({ message: `Issued ${amount} shares`, contributorAddress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to issue shares' });
    }
});

router.get('/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const iface = new ethers.Interface([
            "function getMyShares() view returns (tuple(uint256 amount, string cid)[])"
        ]);
        const contract = new ethers.Contract(diamondAddress, iface, provider);
        const shares = await contract.getMyShares();
        res.status(200).json({ address, shares });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch shares' });
    }
});

export default router;