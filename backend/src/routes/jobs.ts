import express from 'express';
import { JobService } from '../services/job-service';

const router = express.Router();
const jobService = new JobService();

// Get job status by ID
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await jobService.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all jobs (optional, for admin/debugging)
router.get('/', async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel a job (optional feature)
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const success = await jobService.cancelJob(jobId);
    
    if (!success) {
      return res.status(404).json({ error: 'Job not found or cannot be cancelled' });
    }

    res.json({ success: true, message: 'Job cancelled successfully' });
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as jobRoutes };