import { } from 'dotenv/config';

import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

// const app = express();
// const port = 3000;

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });
// app.use('/api/github', githubRoutes);

const gitRepoURL = process.env.GITHUB_REPO_URL;
const gitBaseDir = process.env.LOCAL_BASE_DIR;
const repoName = process.env.GITHUB_REPO;
const repoDir = path.join(gitBaseDir, repoName);
const mainBranchName = process.env.GITHUB_MAIN_BRANCH;
const workingBranchName = 'bug-fix';
const mainBranchDir = path.join(repoDir, mainBranchName);
const workingBranchDir = path.join(repoDir, workingBranchName);

// Create the directory if it doesn't exist
if (!fs.existsSync(workingBranchDir)) {
  fs.mkdirSync(workingBranchDir, { recursive: true });
}

const git = simpleGit({ baseDir: workingBranchDir });
await simpleGit().clone(gitRepoURL, workingBranchDir);
await git.checkoutBranch(workingBranchName, mainBranchName);

await git.pull('origin', mainBranchName);

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
