import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const employeeTeams = pgTable(
  'employee_teams',
  {
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.employeeId, table.teamId] }),
  }),
);

export const gardens = pgTable('gardens', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 50 }),
  monthlyPrice: numeric('monthly_price', { precision: 10, scale: 2 }),
  maintenanceFrequency: varchar('maintenance_frequency', { length: 50 }),
  startDate: date('start_date'),
  billingDay: integer('billing_day'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskTypeEnum = pgEnum('task_type_enum', [
  'maintenance',
  'pruning',
  'cleaning',
  'installation',
  'inspection',
  'emergency',
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  gardenId: uuid('garden_id')
    .notNull()
    .references(() => gardens.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  date: date('date').notNull(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  taskType: taskTypeEnum('task_type').default('maintenance').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workLogs = pgTable('work_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productUnitEnum = pgEnum('product_unit_enum', [
  'unit',
  'kg',
  'g',
  'l',
  'ml',
  'm',
  'm2',
  'm3',
  'pack',
]);

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  unit: productUnitEnum('unit').notNull(),
  stockQuantity: numeric('stock_quantity', { precision: 10, scale: 2 })
    .default('0')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productUsage = pgTable('product_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  gardenId: uuid('garden_id')
    .notNull()
    .references(() => gardens.id, { onDelete: 'cascade' }),
  employeeId: uuid('employee_id').references(() => employees.id, {
    onDelete: 'set null',
  }),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  date: date('date').notNull(),
  notes: text('notes'),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  gardenId: uuid('garden_id')
    .notNull()
    .references(() => gardens.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
});

export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
