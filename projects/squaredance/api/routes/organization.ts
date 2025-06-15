import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
    // Placeholder: Create org + deploy contract + mint initial shares
    const { name, adminAddress, initialShares } = req.body;

    // TODO: deploy diamond + call AdminFacet.createOrganization

    res.status(201).json({ message: `Organization ${name} created`, adminAddress });
});

export const organizationRoutes = router;