import fs from 'fs';
import path from 'path';

const workspaceBaseDir = process.env.LOCAL_BASE_DIR;

const downloadedReposName = 'downloaded-repos';
const treeSitterOutputName = 'tree-sitter-output';
const knowledgeGraphName = 'knowledge-graphs';
const dockerScriptsName = 'docker-scripts';
const logsName = 'logs';

export async function initializeProjectWorkspace(projectName: string) {
  if (!workspaceBaseDir) {
    throw new Error('LOCAL_BASE_DIR is not defined');
  }

  const projectDir = path.join(workspaceBaseDir, projectName);

  // Create the branch directory if it doesn't exist
  const workingBranchDir = path.join(projectDir, downloadedReposName);
  if (!fs.existsSync(workingBranchDir)) {
    fs.mkdirSync(workingBranchDir, { recursive: true });
  }

  // Create the tree-sitter output directory if it doesn't exist
  const treeSitterOutputDir = path.join(projectDir, treeSitterOutputName);
  if (!fs.existsSync(treeSitterOutputDir)) {
    fs.mkdirSync(treeSitterOutputDir, { recursive: true });
  }

  // Create the knowledge graph directory if it doesn't exist
  const knowledgeGraphDir = path.join(projectDir, knowledgeGraphName);
  if (!fs.existsSync(knowledgeGraphDir)) {
    fs.mkdirSync(knowledgeGraphDir, { recursive: true });
  }

  // Create the docker scripts directory if it doesn't exist
  const dockerScriptsDir = path.join(projectDir, dockerScriptsName);
  if (!fs.existsSync(dockerScriptsDir)) {
    fs.mkdirSync(dockerScriptsDir, { recursive: true });
  }

  // Create the logs directory if it doesn't exist
  const logsDir = path.join(projectDir, logsName);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}



// Sample output:
// [
//   {
//     id: 'src',
//     label: 'src',
//     children: [
//       {
//         id: 'components',
//         label: 'components',
//         children: [
//           { id: 'App.tsx', label: 'App.tsx' },
//           { id: 'FileBrowser.tsx', label: 'FileBrowser.tsx' },
//           { id: 'Header.tsx', label: 'Header.tsx' },
//           { id: 'Sidebar.tsx', label: 'Sidebar.tsx' },
//         ],
//       },
//       {
//         id: 'pages',
//         label: 'pages',
//         children: [
//           { id: 'Home.tsx', label: 'Home.tsx' },
//           { id: 'About.tsx', label: 'About.tsx' },
//           { id: 'Contact.tsx', label: 'Contact.tsx' },
//         ],
//       },
//       {
//         id: 'styles',
//         label: 'styles',
//         children: [
//           { id: 'index.css', label: 'index.css' },
//           { id: 'App.css', label: 'App.css' },
//           { id: 'Header.css', label: 'Header.css' },
//           { id: 'Sidebar.css', label: 'Sidebar.css' },
//         ],
//       },
//       { id: 'index.tsx', label: 'index.tsx' },
//       { id: 'reportWebVitals.ts', label: 'reportWebVitals.ts' },
//       { id: 'setupTests.ts', label: 'setupTests.ts' },
//     ],
//   },
//   { id: 'public', label: 'public', children: [] },
//   { id: 'node_modules', label: 'node_modules', children: [] },
//   { id: 'package.json', label: 'package.json' },
//   { id: 'README.md', label: 'README.md' },
//   { id: '.gitignore', label: '.gitignore' },
// ]

/**
 * Returns a nested file structure of the workspace directory
 * @param projectName The project name
 * @param subDir The subdirectory to get the file structure of
 * @returns 
 */
export async function getWorkspaceFileStructure(projectName: string, subDir?: string): Promise<any> {
  if (!workspaceBaseDir) {
    throw new Error('LOCAL_BASE_DIR is not defined');
  }

  const projectDir = path.join(workspaceBaseDir, projectName, subDir || '');

  const files = fs.readdirSync(projectDir, { withFileTypes: true });

  type FileStructure = {
    id: string;
    label: string;
    fullpath?: string;
    extension?: string;
    children?: FileStructure[];
  };

  const fileStructure: FileStructure[] = await Promise.all(files.map(async (file) => {
    const relativePath = path.join(subDir || '', file.name);
    const id = relativePath;
    const label = file.name;
    const fullpath = relativePath
    const extension = path.extname(file.name);

    if (file.isDirectory()) {
      return {
        id: fullpath,
        label,
        fullpath,
        type: "directory",
        children: await getWorkspaceFileStructure(projectName, relativePath),
      };
    }

    return { id: fullpath, label, type: "file", extension };
  }));

  return fileStructure;
}

export async function getWorkspaceFile(projectName: string, filePath: string): Promise<any> {
  if (!workspaceBaseDir) {
    throw new Error('LOCAL_BASE_DIR is not defined');
  }

  const projectDir = path.join(workspaceBaseDir, projectName, filePath);

  // If the given projectDir is a directory, return an error
  if (await workspaceFileIsDirectory(projectName, filePath)) {
    throw new Error('Cannot read a directory');
  }

  const file = fs.readFileSync(projectDir, 'utf-8');

  return file;
}

export async function saveWorkspaceFile(projectName: string, filePath: string, code: string): Promise<void> {
  if (!workspaceBaseDir) {
    throw new Error('LOCAL_BASE_DIR is not defined');
  }

  const projectDir = path.join(workspaceBaseDir, projectName, filePath);

  fs.writeFileSync(projectDir, code);
}

export async function workspaceFileIsDirectory(projectName: string, filePath: string): Promise<boolean> {
  if (!workspaceBaseDir) {
    throw new Error('LOCAL_BASE_DIR is not defined');
  }

  const projectDir = path.join(workspaceBaseDir, projectName, filePath);

  return fs.lstatSync(projectDir).isDirectory();
}