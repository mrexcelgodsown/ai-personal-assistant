import OpenAI from 'openai'
import { PineconeClient } from '@pinecone-database/pinecone'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function initPinecone() {
  const client = new PineconeClient()
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENV || ''
  })
  return client
}

export async function createEmbedding(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  })
  return res.data[0].embedding
}

export async function pineconeUpsert(namespace, id, values, metadata={}) {
  const client = await initPinecone()
  const indexName = process.env.PINECONE_INDEX || 'default-index'
  const index = client.Index(indexName)
  await index.upsert({
    upsertRequest: {
      vectors: [
        {
          id,
          values,
          metadata
        }
      ],
      namespace
    }
  })
}

export async function pineconeQuery(namespace, vector, topK=4) {
  const client = await initPinecone()
  const indexName = process.env.PINECONE_INDEX || 'default-index'
  const index = client.Index(indexName)
  const res = await index.query({
    queryRequest: {
      vector,
      topK,
      namespace,
      includeMetadata: true
    }
  })
  return res
}
