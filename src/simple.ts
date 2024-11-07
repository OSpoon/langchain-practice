import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'
import 'dotenv/config'

const llm = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.chatanywhere.tech',
  },
})

const messages = [
  new SystemMessage('Translate the following from English into Chinese'),
  new HumanMessage('hi!'),
]

const parser = new StringOutputParser();

(async () => {
  const result = await llm
    .pipe(parser)
    .invoke(messages)
  console.log(result)
})()
