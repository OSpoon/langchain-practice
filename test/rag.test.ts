import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { describe, expect, it } from 'vitest'
import 'dotenv/config'
import 'cheerio'

describe('retrieval augmented generation', async () => {
  it('should load', async () => {
    const pTagSelector = 'p'
    const cheerioLoader = new CheerioWebBaseLoader(
      'https://lilianweng.github.io/posts/2023-06-23-agent/',
      {
        selector: pTagSelector,
      },
    )
    const loadedDocs = await cheerioLoader.load()
    expect(loadedDocs.length).toMatchInlineSnapshot(`1`)
  })

  it('should split', async () => {
    // load
    const pTagSelector = 'p'
    const cheerioLoader = new CheerioWebBaseLoader(
      'https://lilianweng.github.io/posts/2023-06-23-agent/',
      {
        selector: pTagSelector,
      },
    )
    const loadedDocs = await cheerioLoader.load()
    // split
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const allSplits = await splitter.splitDocuments(loadedDocs)
    expect(allSplits.length).toMatchInlineSnapshot(`29`)
  })

  it('should store', async () => {
    // load
    const pTagSelector = 'p'
    const cheerioLoader = new CheerioWebBaseLoader(
      'https://lilianweng.github.io/posts/2023-06-23-agent/',
      {
        selector: pTagSelector,
      },
    )
    const loadedDocs = await cheerioLoader.load()
    // split
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const allSplits = await splitter.splitDocuments(loadedDocs)
    // store
    const inMemoryVectorStore = await MemoryVectorStore.fromDocuments(
      allSplits,
      new OpenAIEmbeddings(),
    )
    expect(inMemoryVectorStore.lc_kwargs).toMatchInlineSnapshot()
  })

  it('should retrieve', async () => {
    // load
    const pTagSelector = 'p'
    const cheerioLoader = new CheerioWebBaseLoader(
      'https://lilianweng.github.io/posts/2023-06-23-agent/',
      {
        selector: pTagSelector,
      },
    )
    const loadedDocs = await cheerioLoader.load()
    // split
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const allSplits = await splitter.splitDocuments(loadedDocs)
    // store
    const inMemoryVectorStore = await MemoryVectorStore.fromDocuments(
      allSplits,
      new OpenAIEmbeddings(),
    )
    // retrieve
    const vectorStoreRetriever = inMemoryVectorStore.asRetriever({
      k: 6,
      searchType: 'similarity',
    })
    const retrievedDocuments = await vectorStoreRetriever
      .invoke('What are the approaches to task decomposition?')
    expect(retrievedDocuments[0].pageContent)
      .toMatchInlineSnapshot()
  })
})
