import 'dotenv/config';
import { hash } from 'bcryptjs';
import { inArray } from 'drizzle-orm';
import { db, pool } from '../src/db';
import { employees, users } from '../src/db/schema';

async function seedUsers() {
  const plainPassword = 'Nodeapp2107.';
  const passwordHash = await hash(plainPassword, 10);

  const seedData = [
    {
      email: 'miguellbdefault@gmail.com',
      role: 'admin' as const,
      employeeName: 'Miguel Admin',
    },
    {
      email: 'miguellbwork@gmail.com',
      role: 'employee' as const,
      employeeName: 'Miguel Work',
    },
  ];

  await db.delete(users).where(
    inArray(
      users.email,
      seedData.map((item) => item.email),
    ),
  );

  const insertedUsers = await db
    .insert(users)
    .values(
      seedData.map((item) => ({
        email: item.email,
        passwordHash,
        role: item.role,
      })),
    )
    .returning({ id: users.id, email: users.email });

  await db.insert(employees).values(
    insertedUsers.map((inserted) => {
      const match = seedData.find((item) => item.email === inserted.email);
      return {
        userId: inserted.id,
        name: match?.employeeName ?? inserted.email,
      };
    }),
  );

  console.log('Seed concluido:', insertedUsers.map((u) => u.email).join(', '));
}

seedUsers()
  .catch((error) => {
    console.error('Erro no seed de users:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
