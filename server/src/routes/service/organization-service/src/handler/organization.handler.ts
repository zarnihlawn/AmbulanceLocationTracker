import { Hono } from 'hono';
import { db } from '../db';
import { OrganizationRepository } from '../repo/organization.repo';
import type { CreateOrganizationDto } from '../type/organization.type';
import { OrganizationService } from '../service/organization.service';

const organizationRepo = new OrganizationRepository(db);
const organizationService = new OrganizationService(
  organizationRepo,
);

export const organizationRoutes = new Hono()
  .post('/', async (c) => {
    try {
      const body =
        await c.req.json<CreateOrganizationDto>();
      const organization =
        await organizationService.createOrganization(body);
      return c.json(organization, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create user';
      return c.json({ error: message }, 400);
    }
  })
  .get('/', async (c) => {
    try {
      const organization =
        await organizationService.getOrganizations();
      return c.json(organization);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch organizations';
      return c.json({ error: message }, 500);
    }
  })
  // READ BY ID
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const organization =
        await organizationService.getOrganizationById(id);
      return c.json(organization);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Organization not found';
      return c.json({ error: message }, 404);
    }
  })
  .get('/ownerId/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const organization =
        await organizationService.getOrganizationByOwnerId(
          id,
        );
      return c.json(organization);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Organization not found';
      return c.json({ error: message }, 404);
    }
  });
