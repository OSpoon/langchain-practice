import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { Ollama } from '@langchain/ollama'
import { ChatBot } from './chat.js'
import 'dotenv/config'

// LLM
const llm = new Ollama({
  baseUrl: 'http://localhost:11434',
  model: 'qwen:4b',
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
