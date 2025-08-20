import express from 'express';
import authRoutes from './auth.js'
import cabinsRoutes from './cabins.js'
import reservationsRoutes from './reservations.js'
import availabilityRoutes from './availability.js'
import reviewsRoutes from './reviews.js'
import uploadRoutes from './upload.js'

const app = express();

app.use('/auth', authRoutes);
app.use('/cabins', cabinsRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/availability', availabilityRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/upload', uploadRoutes);

export default app;