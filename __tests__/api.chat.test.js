const httpMocks = require('node-mocks-http')
const path = require('path')

// load the handler
const handlerPath = path.join(process.cwd(), 'pages', 'api', 'chat.js')
const handler = require(handlerPath).default || require(handlerPath)

// Mock OpenAI client used in the module by replacing process.env and stubbing exported functions
jest.mock('openai', () => {
  return {
    default: function Dummy() {
      return {
        chat: {
          completions: {
            create: async (opts) => ({
              choices: [{ message: { content: 'Mock reply from OpenAI' } }]
            })
          }
        }
      }
    }
  }
})

describe('/api/chat', () => {
  it('returns 400 if no messages', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: {} })
    const res = httpMocks.createResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
    const data = res._getJSONData()
    expect(data.error).toBeDefined()
  })

  it('returns a reply when messages provided', async () => {
    const req = httpMocks.createRequest({ method: 'POST', body: { messages: [{ role: 'user', content: 'hello' }] } })
    const res = httpMocks.createResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    const data = res._getJSONData()
    expect(data.reply).toBe('Mock reply from OpenAI')
  })
})
