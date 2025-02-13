import { simpleGit } from 'simple-git';

simpleGit();

const baseDir = process.env.GIT_BASE_DIR;

console.log(baseDir, 'baseDir');

const options = {
  baseDir,
  binary: 'git',
  maxConcurrentProcesses: 6,
};

export const git = simpleGit(options);

export async function cloneBranch(repoUrl: string, branchName: string) {
  try {
    await git.clone(repoUrl);
    await git.checkout(branchName);
  }
  catch (error) {
    console.error('Error cloning branch:', error);
    throw error;
  }
}

export async function createBranch(fromBranch: string, toBranch: string) {
  try {
    await git.checkoutBranch(toBranch, fromBranch);
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
}

export async function getBranches() {
  try {
    const branches = await git.branch();
    return branches;
  } catch (error) {
    console.error('Error getting branches:', error);
    throw error;
  }
}