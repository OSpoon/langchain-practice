import { HumanMessage, SystemMessage } from '@langchain/core/messages'
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
];

(async () => {
  const result = await llm.invoke(messages)
  console.log(result)
})()
