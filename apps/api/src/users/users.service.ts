import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { employees, users } from '../db/schema';
import { User } from './users.types';

@Injectable()
export class UsersService {
  async findById(id: string): Promise<User | null> {
    const row = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        employeeName: employees.name,
      })
      .from(users)
      .leftJoin(employees, eq(employees.userId, users.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!row[0]) {
      return null;
    }

    return this.mapDbUser(row[0]);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const row = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
        employeeName: employees.name,
      })
      .from(users)
      .leftJoin(employees, eq(employees.userId, users.id))
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!row[0]) {
      return null;
    }

    const { passwordHash } = row[0];

    // Supports bcrypt hashes and plain values during transition.
    const validPassword = passwordHash.startsWith('$2')
      ? await compare(password, passwordHash)
      : password === passwordHash;

    if (!validPassword) {
      return null;
    }

    return this.mapDbUser(row[0]);
  }

  private mapDbUser(row: {
    id: string;
    email: string;
    role: string;
    employeeName: string | null;
  }): User {
    return {
      id: row.id,
      email: row.email,
      role: row.role === 'employee' ? 'employee' : 'admin',
      name: row.employeeName ?? this.fallbackNameFromEmail(row.email),
    };
  }

  private fallbackNameFromEmail(email: string): string {
    const base = email.split('@')[0] ?? 'user';
    return base.replace(/[._-]+/g, ' ').trim() || 'User';
  }
}
