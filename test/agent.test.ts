import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { HumanMessage } from '@langchain/core/messages'
import { MemorySaver } from '@langchain/langgraph'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'
import { describe, expect, it } from 'vitest'
import 'dotenv/config'

describe('agent', () => {
  // 定义 Agent 要使用到的工具
  const agentTools = [new TavilySearchResults({ maxResults: 3 })]
  const agentModel = new ChatOpenAI({
    configuration: {
      baseURL: 'https://api.chatanywhere.tech',
    },
    temperature: 0,
  })

  const agentCheckpointer = new MemorySaver()
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
  })

  it('input01', async () => {
    const agentFinalState = await agent.invoke(
      { messages: [new HumanMessage('what is the current weather in sf')] },
      { configurable: { thread_id: '42' } },
    )
    expect(agentFinalState.messages[agentFinalState.messages.length - 1].content)
      .toMatchInlineSnapshot(`
        "The current weather in San Francisco is as follows:
        - Temperature: 15.6°C (60.1°F)
        - Condition: Clear
        - Wind: 3.8 mph from the west
        - Pressure: 1022.0 mb
        - Humidity: 29%
        - Visibility: 16.0 km (9.0 miles)

        For more details, you can visit [Weather in San Francisco](https://www.weatherapi.com/)."
      `)
  })

  it('input02', async () => {
    const agentNextState = await agent.invoke(
      { messages: [new HumanMessage('what about ny')] },
      { configurable: { thread_id: '42' } },
    )

    expect(agentNextState.messages[agentNextState.messages.length - 1].content)
      .toMatchInlineSnapshot(`
        "The current weather in New York is as follows:
        - Temperature: 12.2°C (54.0°F)
        - Condition: Clear
        - Wind: 8.3 mph from the NNW
        - Pressure: 1019.0 mb
        - Humidity: 50%
        - Visibility: 16.0 km (9.0 miles)

        For more details, you can visit [Weather in New York](https://www.weatherapi.com/)."
      `)
  })
})
