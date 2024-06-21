import fs from 'fs';
import path from 'path';

const gitRepoURL = process.env.GITHUB_REPO_URL;
const gitBaseDir = process.env.LOCAL_BASE_DIR;
const repoName = process.env.GITHUB_REPO;
const repoDir = path.join(gitBaseDir, repoName);
const mainBranchName = process.env.GITHUB_MAIN_BRANCH;
const workingBranchName = 'bug-fix';
const mainBranchDir = path.join(repoDir, mainBranchName);
const workingBranchDir = path.join(repoDir, workingBranchName);

export async function initializeLocalWorkspace() {
  // Create the directory if it doesn't exist
  if (!fs.existsSync(workingBranchDir)) {
    fs.mkdirSync(workingBranchDir, { recursive: true });
  }
}
