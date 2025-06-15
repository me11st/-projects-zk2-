import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
    const { adminAddress, contributorAddress, amount, encryptedCID } = req.body;
    // TODO: Call IssuanceFacet to issue shares and log CID
    res.status(200).json({ message: `Issued ${amount} shares`, contributorAddress });
});

router.get('/:address', async (req, res) => {
    const { address } = req.params;
    // TODO: Fetch shares owned by this address (from contract or index)
    res.status(200).json({ address, shares: [] });
});

export default router;