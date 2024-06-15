import os
from pathlib import Path

from autogen import config_list_from_json
from autogen.agentchat.contrib.retrieve_assistant_agent import RetrieveAssistantAgent
from autogen.agentchat.contrib.retrieve_user_proxy_agent import RetrieveUserProxyAgent

os.environ["TOKENIZERS_PARALLELISM"] = "false"

config_list = config_list_from_json(env_or_file="OAI_CONFIG_LIST")
llm_config = {"config_list": config_list}

# Import the ticket object from ticket.json
import json

with open("ticket.json", "r", encoding="utf-8") as f:
    ticket = json.load(f)

assistant = RetrieveAssistantAgent(
    name="assistant",
    system_message="You are a helpful assistant.",
    llm_config=llm_config,
)

# Create a dictionary of code files and their path on disk
workspaceDir = "/Users/dustinstringer/src/orion/workspace/orion-test/bug-fix/src"
fileExtensions = ["jsx", "js", "ts", "tsx", "json", "md", "html", "css", "scss"]

# Add a .txt extension to all files that meet the file extension criteria so that it may be read by the RAG model
for fileExtension in fileExtensions:
    for file in Path(workspaceDir).rglob(f"*.{fileExtension}"):
        # Create a new file with both the original and .txt extension appended to the end
        newFile = file.with_suffix(f".{fileExtension}.txt")
        # Copy the contents of the original file to the new file
        newFile.write_text(file.read_text())


ragproxyagent = RetrieveUserProxyAgent(
    name="ragproxyagent",
    retrieve_config={
        "task": "code",
        "docs_path": workspaceDir,
        "model": "gpt-4-1106-preview",
    },
)

# Build a message prompt based on relavent information from the ticket
message = f"""
Title: {ticket['title']}
Body: {ticket['body']}
"""

print("Message", message)

ragproxyagent.reset()
ragproxyagent.initiate_chat(assistant, problem=message)
