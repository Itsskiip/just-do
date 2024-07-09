import OpenAI from "openai";

// Fetch the API key from the environment variable
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

// Initialize OpenAI with the fetched API key
const openai = new OpenAI({ apiKey });

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a to-do application assistant. The input provided to you will be in the form of text, from which you need to extract the following fields: task, description, due date. You will output these fields as a json object.",
      },
      { role: "user", content: "Complete math homework algebra by 12th aug" },
    ],
    model: "gpt-3.5-turbo-0125",
    response_format: { type: "json_object" },
  });
  console.log(completion.choices[0].message.content);
}

main();
