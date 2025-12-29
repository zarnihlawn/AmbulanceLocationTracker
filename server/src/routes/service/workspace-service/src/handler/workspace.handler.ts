import { Hono } from 'hono';
import { WorkspaceRepository } from '../repo/workspace.repo';
import { db } from '../db';
import { WorkspaceService } from '../service/workspace.service';
import { type CreateWorkspaceDto } from '../interface/workspace.interface';

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
      error instanceof Error
        ? error.message
        : `Failed to create workspacce`;
      return;
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
  });
