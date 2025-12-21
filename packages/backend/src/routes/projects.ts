/**
 * Projects Routes - CRUD operations for user projects
 */

import express from 'express';
import { requireAuth } from '../auth/middleware';
import { db } from '../db';

const router = express.Router();

// All project routes require authentication
router.use(requireAuth);

/**
 * GET /api/projects - List user's projects
 */
router.get('/', async (req, res) => {
  try {
    const projects = await db.project.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    res.json(projects);
    
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
    const project = await db.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });
    
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
    
    const project = await db.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: req.user!.userId,
      }
    });
    
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
    
    // Verify ownership
    const existing = await db.project.findFirst({
      where: {
        id: req.params.id,
        userId: (req as any).userId
      }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }
    
    const project = await db.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(thumbnail !== undefined && { thumbnail }),
        updatedAt: new Date(),
      }
    });
    
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
    
    // Verify ownership
    const existing = await db.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }
    
    const project = await db.project.update({
      where: { id: req.params.id },
      data: {
        data: data,
        updatedAt: new Date(),
      }
    });
    
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
    // Verify ownership
    const existing = await db.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }
    
    await db.project.delete({
      where: { id: req.params.id }
    });
    
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

