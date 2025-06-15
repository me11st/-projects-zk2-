import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
    const { contributorAddress, encryptedCID } = req.body;
    // TODO: Record contributor address and CID (e.g., emit event or log locally)
    res.status(201).json({ message: 'Contributor added', contributorAddress });
});

export default router;