import fs from "fs";
import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";

export function main() {
  const parser = new Parser();
  parser.setLanguage(JavaScript);

  const filePath = `/home/neg-0/src/orion/workspace/orion-test/main/src/App.jsx`
  const source = fs.readFileSync(filePath, "utf8");

  const tree = parser.parse(source);

  // Save the tree to a file
  const treeFilePath = `/home/neg-0/src/orion/workspace/orion-test/main/src/App.tree`;
  fs.writeFileSync(treeFilePath, JSON.stringify(tree.rootNode, null, 2));
}

export default main;