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
        content: `You are a to-do application assistant.
        The user will input raw data copied from a webpage.
        Extract the following fields concisely as JSON:
          1. 'task'. Try to keep it under 20 characters if possible.
          2. 'description'. Try to keep it under 30 characters if possible.
          3. 'dueDate', in yyyy-MM-dd format. This date and time should usually be past today's date, ${new Date(Date.now()).toLocaleString()}, unless explicitly stated.
        Output these fields formatted as JSON.
        You may leave any field blank if you have insufficient information.`
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
      console.log(messageJson)
      return messageJson;
    } else {
      return 'No choices found in the response.';
    }
  } catch (error) {
    return 'Error:' + error;
  }
}