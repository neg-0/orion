import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Create the projects table
  await knex.schema.createTable('projects', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.string('repository_url').notNullable();
    table.string('issues_url').notNullable();
    table.string('workspace_location').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  // Drop the projects table
  await knex.schema.dropTable('projects');
}

