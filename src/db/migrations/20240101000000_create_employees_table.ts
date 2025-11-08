/**
 * Initial Migration: Create Employees Table
 *
 * Creates the employees table with all necessary columns and indexes
 * Salary stored as integer cents to avoid floating-point precision issues
 *
 * @migration
 */
import { Knex } from 'knex';

/**
 * Create employees table
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('employees', (table) => {
    // Primary key
    table.increments('id').primary();

    // Employee details
    table.string('name', 100).notNullable().comment('Employee full name');
    table
      .string('email', 255)
      .notNullable()
      .unique()
      .comment('Employee email address (unique)');
    table.string('job_title', 100).notNullable().comment('Employee job title/position');
    table
      .string('country', 2)
      .notNullable()
      .comment('ISO 3166-1 alpha-2 country code (US, UK, IN, CA)');

    // Salary stored as integer cents
    table
      .bigInteger('gross_salary_cents')
      .notNullable()
      .comment('Gross annual salary in cents (integer)');

    // Timestamps
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes for common queries
    table.index('email', 'idx_employees_email');
    table.index('country', 'idx_employees_country');
    table.index('job_title', 'idx_employees_job_title');
    table.index(['country', 'job_title'], 'idx_employees_country_job_title');
  });
}

/**
 * Drop employees table
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('employees');
}
