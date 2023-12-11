import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { BufferMemory } from "langchain/memory";
import { RunnableBranch, RunnableSequence } from "langchain/schema/runnable";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { LLMChain } from "langchain/chains";
import { formatDocumentsAsString } from "langchain/util/document";


const {SupabaseVectorStore} = require("langchain/vectorstores/supabase");
const {createClient} = require("@supabase/supabase-js");


export const run = async (data) => {

   // Convert JSON object to JSON-formatted string
   const jsonString = JSON.stringify(data, null, 2);

   const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
   const docs = await textSplitter.createDocuments([jsonString]);

  /* Initialize the LLM to use to answer the question */
  const openAIApiKey = "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";

  const embeddings = new OpenAIEmbeddings({modelName:"ada v2",  openAIApiKey });
  /* Create the vectorstore */
  /// Embed and Upload to Supabase
  const sbApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHBjcWhnZ2xka2hpdnVicmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA5MjI1NDMsImV4cCI6MjAxNjQ5ODU0M30.7YNK_fXLocoKUSsehbOOw0nBNl0ZEV-DyTfP0zNa6JY";
  const sbUrl = "https://mllpcqhggldkhivubrdi.supabase.co";
  const client = createClient(sbUrl, sbApiKey)
  const db = await SupabaseVectorStore.fromDocuments(docs, embeddings, {client, tableName: 'documents',})
 
  return db;
}

type inquiry = string;

export const interact = async (retriever, question: inquiry) => {

  const openAIApiKey = "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";
  const model = new ChatOpenAI({ openAIApiKey });

  const serializeChatHistory = (chatHistory: string | Array<string>) => {
    if (Array.isArray(chatHistory)) {
      return chatHistory.join("\n");
    }
    return chatHistory;
  };

  const memory = new BufferMemory({
    memoryKey: "chatHistory",
  });

  /**
   * Create a prompt template for generating an answer based on context and
   * a question.
   *
   * Chat history will be an empty string if it's the first question.
   *
   * inputVariables: ["chatHistory", "context", "question"]
   */
  const questionPrompt = PromptTemplate.fromTemplate(
    `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
CHAT HISTORY: {chatHistory}
----------------
CONTEXT: {context}
----------------
QUESTION: {question}
----------------
Helpful Answer:`
  );

  /**
   * Creates a prompt template for __generating a question__ to then ask an LLM
   * based on previous chat history, context and the question.
   *
   * inputVariables: ["chatHistory", "question"]
   */
  const questionGeneratorTemplate =
    PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
----------------
CHAT HISTORY: {chatHistory}
----------------
FOLLOWUP QUESTION: {question}
----------------
Standalone question:`);

  const handleProcessQuery = async (input: {
    question: string;
    context: string;
    chatHistory?: string | Array<string>;
  }) => {
    const chain = new LLMChain({
      llm: model,
      prompt: questionPrompt,
      outputParser: new StringOutputParser(),
    });

    const { text } = await chain.call({
      ...input,
      chatHistory: serializeChatHistory(input.chatHistory ?? ""),
    });

    await memory.saveContext(
      {
        human: input.question,
      },
      {
        ai: text,
      }
    );

    return text;
  };

  const answerQuestionChain = RunnableSequence.from([
    {
      question: (input: {
        question: string;
        chatHistory?: string | Array<string>;
      }) => input.question,
    },
    {
      question: (previousStepResult: {
        question: string;
        chatHistory?: string | Array<string>;
      }) => previousStepResult.question,
      chatHistory: (previousStepResult: {
        question: string;
        chatHistory?: string | Array<string>;
      }) => serializeChatHistory(previousStepResult.chatHistory ?? ""),
      context: async (previousStepResult: {
        question: string;
        chatHistory?: string | Array<string>;
      }) => {
        // Fetch relevant docs and serialize to a string.
        const relevantDocs = await retriever.getRelevantDocuments(
          previousStepResult.question
        );
        const serialized = formatDocumentsAsString(relevantDocs);
        return serialized;
      },
    },
    handleProcessQuery,
  ]);

  const generateQuestionChain = RunnableSequence.from([
    {
      question: (input: {
        question: string;
        chatHistory: string | Array<string>;
      }) => input.question,
      chatHistory: async () => {
        const memoryResult = await memory.loadMemoryVariables({});
        return serializeChatHistory(memoryResult.chatHistory ?? "");
      },
    },
    questionGeneratorTemplate,
    model,
    // Take the result of the above model call, and pass it through to the
    // next RunnableSequence chain which will answer the question
    {
      question: (previousStepResult: { text: string }) =>
        previousStepResult.text,
    },
    answerQuestionChain,
  ]);

  const branch = RunnableBranch.from([
    [
      async () => {
        const memoryResult = await memory.loadMemoryVariables({});
        const isChatHistoryPresent = !memoryResult.chatHistory.length;

        return isChatHistoryPresent;
      },
      answerQuestionChain,
    ],
    [
      async () => {
        const memoryResult = await memory.loadMemoryVariables({});
        const isChatHistoryPresent =
          !!memoryResult.chatHistory && memoryResult.chatHistory.length;

        return isChatHistoryPresent;
      },
      generateQuestionChain,
    ],
    answerQuestionChain,
  ]);

  const fullChain = RunnableSequence.from([
    {
      question: (input: { question: string }) => input.question,
    },
    branch,
  ]);

  const resultOne = await fullChain.invoke({
    question: question,
  });

  console.log({ resultOne });
};