export async function fetchOpenAI(userContent, apiKey) {
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
        content: "You are a to-do application assistant. The user will input raw text copied from a webpage, from which you need to extract the following fields concisely: task (str), description (str), dueDate (yyyy-MM-dd). You will output these fields as a json object. You may leave any of the fields blank if you have insufficient information."
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
      let messageJson = JSON.parse(messageContent)
      return messageJson;
    } else {
      return 'No choices found in the response.';
    }
  } catch (error) {
    return 'Error:' + error;
  }
}