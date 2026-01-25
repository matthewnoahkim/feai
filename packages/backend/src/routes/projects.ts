/**
 * Projects Routes - CRUD operations for projects
 * Uses in-memory store (no authentication required)
 */

import express from 'express';

const router = express.Router();

// In-memory project store
interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

const projects: Map<string, Project> = new Map();

function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/projects - List all projects
 */
router.get('/', async (req, res) => {
  try {
    const projectList = Array.from(projects.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map(({ id, name, description, thumbnail, createdAt, updatedAt }) => ({
        id, name, description, thumbnail, createdAt, updatedAt
      }));
    
    res.json(projectList);
    
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list projects' }
    });
  }
});

/**
 * GET /api/projects/:id - Get single project
 */
router.get('/:id', async (req, res) => {
  try {
    const project = projects.get(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }
    
    res.json(project);
    
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get project' }
    });
  }
});

/**
 * POST /api/projects - Create new project
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Project name is required' }
      });
    }
    
    const now = new Date();
    const project: Project = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim() || undefined,
      userId: 'anonymous',
      createdAt: now,
      updatedAt: now,
    };
    
    projects.set(project.id, project);
    
    res.status(201).json(project);
    
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' }
    });
  }
});

/**
 * PATCH /api/projects/:id - Update project metadata
 */
router.patch('/:id', async (req, res) => {
  try {
    const { name, description, thumbnail } = req.body;
    
    const project = projects.get(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }
    
    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description?.trim() || undefined;
    if (thumbnail !== undefined) project.thumbnail = thumbnail;
    project.updatedAt = new Date();
    
    projects.set(project.id, project);
    
    res.json(project);
    
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update project' }
    });
  }
});

/**
 * PUT /api/projects/:id/data - Save project CAD data
 */
router.put('/:id/data', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Project data is required' }
      });
    }
    
    const project = projects.get(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }
    
    project.data = data;
    project.updatedAt = new Date();
    
    projects.set(project.id, project);
    
    res.json({ success: true, updatedAt: project.updatedAt });
    
  } catch (error) {
    console.error('Save project data error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to save project data' }
    });
  }
});

/**
 * DELETE /api/projects/:id - Delete project
 */
router.delete('/:id', async (req, res) => {
  try {
    const project = projects.get(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }
    
    projects.delete(req.params.id);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete project' }
    });
  }
});

export const projectsRouter = router;
