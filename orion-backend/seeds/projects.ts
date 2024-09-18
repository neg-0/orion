import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("projects").del();

  // Inserts seed entries
  await knex("projects").insert([
    { id: 1, name: "orion-test", description: "Description 1", repository_url: "https://github.com/neg-0/orion-test", issues_url: "https://github.com/neg-0/orion-test/issues", workspace_location: "orion-test" }
  ]);
};
