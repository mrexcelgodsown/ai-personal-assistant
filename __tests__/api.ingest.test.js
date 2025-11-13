const httpMocks = require('node-mocks-http')
const path = require('path')

// mock the createEmbedding and pineconeUpsert functions
jest.mock('../../lib/vectorstore', () => ({
  createEmbedding: async (text) => Array(8).fill(0.1),
  pineconeUpsert: async (namespace, id, values, metadata) => ({ ok: true })
}))

const handlerPath = path.join(process.cwd(), 'pages', 'api', 'ingest.js')
const handler = require(handlerPath).default || require(handlerPath)

describe('/api/ingest', () => {
  it('returns 400 when missing params', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: {} })
    const res = httpMocks.createResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('ingests successfully with id and text', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: { id: 'doc1', text: 'hello world' } })
    const res = httpMocks.createResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    const data = res._getJSONData()
    expect(data.ok).toBe(true)
  })
})
