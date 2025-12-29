import { Hono } from 'hono';
import { type CreateFeatureDto } from '../interface/feature.interface';
import { FeatureRepository } from '../repo/feature.repo';
import { FeatureService } from '../service/feature.service';
import { db } from '../db';

const featureRepo = new FeatureRepository(db);
const featureService = new FeatureService(featureRepo);

export const featureRoutes = new Hono()
  .post('/', async (c) => {
    try {
      const body = await c.req.json<CreateFeatureDto>();
      const feature =
        await featureService.createFeature(body);
      return c.json(feature, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create feature';
      return c.json({ error: message }, 400);
    }
  })
  .get('/', async (c) => {
    try {
      const feature = await featureService.getFeature();
      return c.json(feature);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to fetch feature`;
      return c.json({ error: message }, 500);
    }
  })
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const feature =
        await featureService.getFeatureById(id);
      return c.json(feature);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Feature not found`;
      return c.json({ error: message }, 404);
    }
  });
