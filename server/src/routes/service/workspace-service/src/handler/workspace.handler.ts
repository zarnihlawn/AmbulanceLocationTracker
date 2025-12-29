import { Hono } from 'hono';
import { WorkspaceRepository } from '../repo/workspace.repo';
import { db } from '../db';
import { WorkspaceService } from '../service/workspace.service';
import { type CreateWorkspaceDto, type UpdateWorkspaceDto } from '../interface/workspace.interface';

const workspaceRepo = new WorkspaceRepository(db);
const workspaceService = new WorkspaceService(
  workspaceRepo,
);

export const workspaceRoutes = new Hono()
  .post('/', async (c) => {
    try {
      const body = await c.req.json<CreateWorkspaceDto>();
      const workspace =
        await workspaceService.createWorkspace(body);
      return c.json(workspace, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create workspace';
      return c.json({ error: message }, 400);
    }
  })
  .get('/', async (c) => {
    try {
      const workspace =
        await workspaceService.getWorkspace();
      return c.json(workspace);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to fetch workspace`;
      return c.json({ error: message }, 500);
    }
  })
  .get('/organizationId/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const workspaces =
        await workspaceService.getWorkspacesByOrganizationId(
          id,
        );
      return c.json(workspaces);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch workspaces';
      return c.json({ error: message }, 500);
    }
  })
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const workspace =
        await workspaceService.getWorkspaceById(id);
      return c.json(workspace);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Workspace not found';
      return c.json({ error: message }, 404);
    }
  })
  // UPDATE
  .patch('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateWorkspaceDto>();
      const workspace = await workspaceService.updateWorkspace(id, body);
      return c.json(workspace);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update workspace';
      const statusCode = message.includes('not found')
        ? 404
        : 400;
      return c.json({ error: message }, statusCode);
    }
  })
  // DELETE
  .delete('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      await workspaceService.deleteWorkspace(id);
      return c.json(
        { message: 'Workspace deleted successfully' },
        200,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete workspace';
      return c.json({ error: message }, 404);
    }
  });
