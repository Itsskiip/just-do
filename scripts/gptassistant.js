import fetch from 'node-fetch';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

export async function fetchOpenAI(userContent) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  const body = JSON.stringify({
    model: "gpt-3.5-turbo-0125",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a to-do application assistant. The input provided to you will be in the form of text, from which you need to extract the following fields: task, description, due date. You will output these fields as a json object."
      },
      {
        role: "user",
        content: userContent
      }
    ]
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const messageContent = data.choices[0].message.content;
      console.log(messageContent);
    } else {
      console.error('No choices found in the response.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


console.log(fetchOpenAI("math homework, algebra, 28/01/29"))