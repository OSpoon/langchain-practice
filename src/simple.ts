import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import 'dotenv/config'

// LLM
const llm = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.chatanywhere.tech',
  },
})

// Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'Translate the following into {language}:'],
  ['user', '{text}'],
])

// Output Parser
const parser = new StringOutputParser();

(async () => {
  // LangChain Expression Language (LCEL)
  const result = await prompt
    .pipe(llm)
    .pipe(parser)
    .invoke({ language: 'Chinese', text: 'hi' })
  console.log(result)
})()
