import knex from "../middleware/knex";
import { initializeProjectWorkspace } from "./workspaceController";

export async function initializeProject(projectName: string) {
  // Establish the project directory
  initializeProjectWorkspace(projectName)

  // Save the project information to the database
  knex('projects').insert({
    name: projectName,
    created_at: new Date(),
  });
}

export async function getProjects() {
  // Retrieve all projects from the database
  return knex('projects').select('*');
}