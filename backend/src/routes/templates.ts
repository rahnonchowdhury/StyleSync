import express from 'express';
import { TemplateService } from '../services/template-service';

const router = express.Router();
const templateService = new TemplateService();

// Get all style templates
router.get('/', async (req, res) => {
  try {
    const templates = await templateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific template by ID
router.get('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await templateService.getTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as templateRoutes };