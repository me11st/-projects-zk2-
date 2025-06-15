import express from 'express';
import { organizationRoutes } from './routes/organization';

const app = express();
app.use(express.json());

app.use('/organization', organizationRoutes);

app.listen(3000, () => {
    console.log('Captable API server running on http://localhost:3000');
});