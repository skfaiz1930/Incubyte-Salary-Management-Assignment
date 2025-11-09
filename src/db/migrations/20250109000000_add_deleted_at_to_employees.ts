import { Knex } from 'knex';

/**
 * Migration to add soft delete functionality to employees table
 * - Adds deleted_at timestamp column (nullable)
 * - Adds index on deleted_at for query performance
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('employees', (table) => {
    table
      .timestamp('deleted_at')
      .nullable()
      .comment('Timestamp when the record was soft deleted, NULL if active');
  });

  // Add index for better query performance on active records
  await knex.schema.raw('CREATE INDEX idx_employees_deleted_at ON employees(deleted_at) WHERE deleted_at IS NULL');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('employees', (table) => {
    table.dropColumn('deleted_at');
  });
}
