const fs = require("fs");
const OpenAI = require("openai");

const openAIApiKey = "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";

const openai = new OpenAI({
  apiKey: openAIApiKey
});

export async function main(data) {
  const jsonData = fs.readFileSync(data); // Read JSON file
  const jsonString = JSON.stringify(jsonData); // Convert JSON to string

  const file = await openai.files.create({
    file: jsonString, // Upload JSON string as file content
    purpose: "assistants",
  });

  const myAssistant = await openai.beta.assistants.create({
    instructions:
      "You are a Developer Advocate, and you have access to files to answer developer questions about company documentation.",
    name: "Dev Advocate",
    tools: [{ type: "retrieval" }],
    model: "gpt-3.5-turbo-1106",
    file_ids: [file.id],
  });



  console.log(myAssistant);
}