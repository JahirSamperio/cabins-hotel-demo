import express from 'express';
import authRoutes from './auth.js'
import cabinsRoutes from './cabins.js'
import reservationsRoutes from './reservations.js'
import availabilityRoutes from './availability.js'
import reviewsRoutes from './reviews.js'
import uploadRoutes from './upload.js'
import cronJobsRoutes from './cronJobs.js'
import adminRoutes from './admin.js'
import financialRoutes from './financial.js'
import exportRoutes from './export.js'

const app = express();

app.use('/auth', authRoutes);
app.use('/cabins', cabinsRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/availability', availabilityRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/upload', uploadRoutes);
app.use('/cron', cronJobsRoutes);
app.use('/admin', adminRoutes);
app.use('/financial', financialRoutes);
app.use('/export', exportRoutes);

export default app;