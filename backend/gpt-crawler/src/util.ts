import fs from "fs";
import OpenAI from "openai";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const openai = new OpenAI({
  apiKey: ""
});

const outputPath = path.resolve(__dirname, 'output.json');

export async function main(): Promise<OpenAI.Beta.Assistants.Assistant> {
  
  const file = await openai.files.create({
    file:  fs.createReadStream(outputPath), // Upload JSON string as file content
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
  return myAssistant;
}
