import os

import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def ask_gpt(prompt):
    try:
        response = openai.Completion.create(
            engine="text-davinci-004",  # or another model
            prompt=prompt,
            max_tokens=150,  # You can adjust this
        )
        return response.choices[0].text.strip()
    except Exception as e:
        return str(e)


if __name__ == "__main__":
    test_prompt = "Translate the following Python code to JavaScript:\n\nPython code:\nprint('Hello, world!')"
    print(ask_gpt(test_prompt))
