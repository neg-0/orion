import { Octokit } from "@octokit/rest";

const owner = process.env.GITHUB_USER;
const repo = process.env.GITHUB_REPO;

console.log("owner:", owner);
console.log("repo:", repo);

const octokit = new Octokit(
  {
    auth: process.env.GITHUB_TOKEN,
  }
);

export async function getIssues(params) {
  try {
    const response = await octokit.issues.listForRepo({
      owner,
      repo,
      ...params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub issues:", error);
    throw error;
  }
}

export async function getIssue(number) {
  try {
    const response = await octokit.issues.get({
      owner,
      repo,
      issue_number: number,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching GitHub issue:", error);
    throw error;
  }
}