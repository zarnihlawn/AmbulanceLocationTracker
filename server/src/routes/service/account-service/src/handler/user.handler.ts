import { Hono } from 'hono';
import { UserService } from '../service/user.service';
import { UserRepository } from '../repo/user.repo';
import { db } from '../db';
import type {
  CreateUserDto,
  UpdateUserDto,
} from '../type/user.type';

// Initialize dependencies
const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);

// Create routes with CRUD operations
export const userRoutes = new Hono()
  // CREATE
  .post('/', async (c) => {
    try {
      const body = await c.req.json<CreateUserDto>();
      const user = await userService.createUser(body);
      return c.json(user, 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create user';
      return c.json({ error: message }, 400);
    }
  })
  // READ ALL
  .get('/', async (c) => {
    try {
      const users = await userService.getAllUsers();
      return c.json(users);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to fetch users';
      return c.json({ error: message }, 500);
    }
  })
  // READ BY ID
  .get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const user = await userService.getUserById(id);
      return c.json(user);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'User not found';
      return c.json({ error: message }, 404);
    }
  })
  // UPDATE
  .put('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateUserDto>();
      const user = await userService.updateUser(id, body);
      return c.json(user);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update user';
      const statusCode = message.includes('not found')
        ? 404
        : 400;
      return c.json({ error: message }, statusCode);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json<UpdateUserDto>();
      const user = await userService.updateUser(id, body);
      return c.json(user);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update user';
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
      await userService.deleteUser(id);
      return c.json(
        { message: 'User deleted successfully' },
        200,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete user';
      return c.json({ error: message }, 404);
    }
  });
