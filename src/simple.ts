import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { ChatBot } from './chat.js'
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
const parser = new StringOutputParser()

new ChatBot({
  async respond(input) {
    const result = await prompt
      .pipe(llm)
      .pipe(parser)
      .invoke({ language: 'Chinese', text: input })
    return result
  },
}).run()
