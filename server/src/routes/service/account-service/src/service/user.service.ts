import { UserRepository } from '../repo/user.repo';
import type {
  CreateUserDto,
  UpdateUserDto,
} from '../type/user.type';
import {
  userSchema,
  type NewUser,
} from '../schema/user.schema';

// Simple password hashing (use bcrypt in production)
async function hashPassword(
  password: string,
): Promise<string> {
  // In production, use: import { hash } from 'bcrypt'; return hash(password, 10);
  // For now, simple base64 encoding (NOT SECURE - use bcrypt in production)
  return Buffer.from(password).toString('base64');
}

async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  // In production, use: import { compare } from 'bcrypt'; return compare(password, hash);
  // For now, simple comparison (NOT SECURE - use bcrypt in production)
  return Buffer.from(password).toString('base64') === hash;
}

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(data: CreateUserDto) {
    // Check if email already exists (if provided)
    if (data.email) {
      const existingEmail = await this.userRepo.findByEmail(
        data.email,
      );
      if (existingEmail) {
        throw new Error(
          `User with email ${data.email} already exists`,
        );
      }
    }

    // Check if username already exists (if provided)
    if (data.username) {
      const existingUsername =
        await this.userRepo.findByUsername(data.username);
      if (existingUsername) {
        throw new Error(
          `User with username ${data.username} already exists`,
        );
      }
    }

    // Check if NRC already exists (if provided)
    if (data.nrc) {
      const existingNrc = await this.userRepo.findByNrc(
        data.nrc,
      );
      if (existingNrc) {
        throw new Error(
          `User with NRC ${data.nrc} already exists`,
        );
      }
    }

    // Check if phone number already exists (if provided)
    if (data.phoneNumber) {
      const existingPhone =
        await this.userRepo.findByPhoneNumber(
          data.phoneNumber,
        );
      if (existingPhone) {
        throw new Error(
          `User with phone number ${data.phoneNumber} already exists`,
        );
      }
    }

    // Hash password if provided
    const passwordHash = data.password
      ? await hashPassword(data.password)
      : null;

    const newUser: NewUser = {
      email: data.email || null,
      username: data.username || null,
      passwordHash: passwordHash || null,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      nrc: data.nrc || null,
      phoneNumber: data.phoneNumber || null,
      address: data.address || null,
      isActive: true,
    };

    const user = await this.userRepo.create(newUser);
    // Don't return password hash
    const { passwordHash: _, ...userWithoutPassword } =
      user;
    return userWithoutPassword;
  }

  async getAllUsers() {
    const allUsers = await this.userRepo.findAll();
    // Remove password hashes
    return allUsers.map(
      ({ passwordHash, ...user }) => user,
    );
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    // Check if user exists
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }

    // Check for email conflicts
    if (data.email && data.email !== existing.email) {
      const emailExists = await this.userRepo.findByEmail(
        data.email,
      );
      if (emailExists) {
        throw new Error(
          `User with email ${data.email} already exists`,
        );
      }
    }

    // Check for username conflicts
    if (
      data.username &&
      data.username !== existing.username
    ) {
      const usernameExists =
        await this.userRepo.findByUsername(data.username);
      if (usernameExists) {
        throw new Error(
          `User with username ${data.username} already exists`,
        );
      }
    }

    // Check for NRC conflicts
    if (data.nrc && data.nrc !== existing.nrc) {
      const nrcExists = await this.userRepo.findByNrc(
        data.nrc,
      );
      if (nrcExists) {
        throw new Error(
          `User with NRC ${data.nrc} already exists`,
        );
      }
    }

    // Check for phone number conflicts
    if (
      data.phoneNumber &&
      data.phoneNumber !== existing.phoneNumber
    ) {
      const phoneExists =
        await this.userRepo.findByPhoneNumber(
          data.phoneNumber,
        );
      if (phoneExists) {
        throw new Error(
          `User with phone number ${data.phoneNumber} already exists`,
        );
      }
    }

    const updateData: Partial<NewUser> = {};
    if (data.email !== undefined)
      updateData.email = data.email;
    if (data.username !== undefined)
      updateData.username = data.username;
    if (data.password)
      updateData.passwordHash = await hashPassword(
        data.password,
      );
    if (data.firstName !== undefined)
      updateData.firstName = data.firstName || null;
    if (data.lastName !== undefined)
      updateData.lastName = data.lastName || null;
    if (data.nrc !== undefined) updateData.nrc = data.nrc;
    if (data.phoneNumber !== undefined)
      updateData.phoneNumber = data.phoneNumber;
    if (data.address !== undefined)
      updateData.address = data.address;
    if (data.isActive !== undefined)
      updateData.isActive = data.isActive;

    const updated = await this.userRepo.update(
      id,
      updateData,
    );
    if (!updated) {
      throw new Error(
        `Failed to update user with id ${id}`,
      );
    }

    const { passwordHash, ...userWithoutPassword } =
      updated;
    return userWithoutPassword;
  }

  async deleteUser(id: string) {
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }

    return await this.userRepo.delete(id);
  }

  async login(emailOrUsername?: string, password?: string) {
    // Require credentials for login
    if (!emailOrUsername || !password) {
      throw new Error('Email/username and password are required');
    }

    const user =
      await this.userRepo.findByEmailOrUsername(
        emailOrUsername,
      );
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    if (!user.passwordHash) {
      throw new Error('User has no password set');
    }

    const isValidPassword = await comparePassword(
      password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.userRepo.update(user.id, {
      lastLogin: new Date(),
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      throw new Error('If an account with that email exists, a password reset link has been sent');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Generate reset token (simple implementation - use crypto.randomBytes in production)
    const resetToken = Buffer.from(`${user.id}-${Date.now()}-${Math.random()}`)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Set expiry to 1 hour from now
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Save reset token to user
    await this.userRepo.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    return resetToken;
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<void> {
    // Find user by reset token
    const user = await this.userRepo.findByPasswordResetToken(resetToken);

    if (!user) {
      throw new Error('Invalid reset token');
    }

    // Check if token is expired
    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await this.userRepo.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }
}
