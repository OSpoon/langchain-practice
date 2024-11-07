import { trimMessages } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { Annotation, END, MemorySaver, MessagesAnnotation, START, StateGraph } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import { describe, expect, it } from 'vitest'
import 'dotenv/config'

describe('chatbot', () => {
  const llm = new ChatOpenAI({
    configuration: {
      baseURL: 'https://api.chatanywhere.tech',
    },
    temperature: 0,
  })

  const GraphAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    language: Annotation<string>(),
  })

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      'You are a helpful assistant. Answer all questions to the best of your ability in {language}.',
    ],
    new MessagesPlaceholder('messages'),
  ])

  const parser = new StringOutputParser()

  const trimmer = trimMessages({
    maxTokens: 10,
    strategy: 'last',
    tokenCounter: msgs => msgs.length,
    includeSystem: true,
    allowPartial: false,
    startOn: 'human',
  })

  const callMode = async (state: typeof GraphAnnotation.State) => {
    const trimmedMessage = await trimmer.invoke(state.messages)
    const response = await prompt
      .pipe(llm)
      .pipe(parser)
      .invoke({
        messages: trimmedMessage,
        language: state.language,
      })
    return { messages: [response] }
  }

  const workflow = new StateGraph(GraphAnnotation)
    .addNode('model', callMode)
    .addEdge(START, 'model')
    .addEdge('model', END)

  const memory = new MemorySaver()
  const app = workflow.compile({ checkpointer: memory })

  it('chat 01', async () => {
    const output = await app.invoke({
      messages: [
        { role: 'user', content: 'Hi! I\'m Bob.' },
      ],
      language: 'Chinese',
    }, {
      configurable: {
        thread_id: '5a487538-be4d-4d3a-b081-2cbc8320e0f9',
      },
    })
    expect(output.messages.at(-1)).toMatchInlineSnapshot(`
      {
        "id": [
          "langchain_core",
          "messages",
          "HumanMessage",
        ],
        "kwargs": {
          "additional_kwargs": {},
          "content": "你好！我是Bob。有什么可以帮助你的吗？",
          "id": "caf56b11-600e-4c00-b399-a7c512229700",
          "response_metadata": {},
        },
        "lc": 1,
        "type": "constructor",
      }
    `)
  })

  it('chat 02', async () => {
    const output = await app.invoke({
      messages: [
        { role: 'user', content: 'What\'s my name?' },
      ],
    }, {
      configurable: {
        thread_id: '5a487538-be4d-4d3a-b081-2cbc8320e0f9',
      },
    })
    expect(output.messages.at(-1)).toMatchInlineSnapshot(`
      {
        "id": [
          "langchain_core",
          "messages",
          "HumanMessage",
        ],
        "kwargs": {
          "additional_kwargs": {},
          "content": "你的名字是Bob。",
          "id": "23010d85-4087-4ba1-a89d-c250b0607848",
          "response_metadata": {},
        },
        "lc": 1,
        "type": "constructor",
      }
    `)
  })
})
