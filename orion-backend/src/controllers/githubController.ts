// import { Octokit } from "@octokit/rest";

const owner = process.env.GITHUB_USER;
const repo = process.env.GITHUB_REPO;

console.log("owner:", owner);
console.log("repo:", repo);

// const octokit = new Octokit(
//   {
//     auth: process.env.GITHUB_TOKEN,
//   }
// );

// export async function getIssues(params) {
//   try {
//     const response = await octokit.issues.listForRepo({
//       owner,
//       repo,
//       ...params,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching GitHub issues:", error);
//     throw error;
//   }
// }

// export async function getIssue(number) {
//   try {
//     const response = await octokit.issues.get({
//       owner,
//       repo,
//       issue_number: number,
//     });

//     return response.data;
//   } catch (error) {
//     console.error("Error fetching GitHub issue:", error);
//     throw error;
//   }
// }

// // This service serves as a listener for the GitHub API.
// // It performs the following actions:
// // 1. Monitors a given GitHub repository for new issues.
// // 2. When a new issue is detected, it will analyze the issue against specific criteria.
// // 3. If the issue meets the criteria, it will be added to the database.
// // 4. If the issue does not meet the criteria, it will be ignored.
// // 5. The service will run continuously, checking for new issues every 5 minutes.

// export async function listenForIssues(fetchRate = 300000) {
//   console.log("Listening for new issues...");

//   setInterval(async () => {
//     const issues = await getIssues({
//       state: "open",
//       sort: "created",
//       direction: "asc",
//     });

//     for (const issue of issues) {
//       console.log("Issue:", issue.title);
//     }
//   }, fetchRate);
// }