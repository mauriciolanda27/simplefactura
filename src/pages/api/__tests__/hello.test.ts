import { createMocks } from 'node-mocks-http'
import handler from '../hello'

describe('API Endpoint /api/hello', () => {
  it('debe devolver respuesta con nombre por defecto', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        name: 'John Doe',
      })
    )
  })

  it('debe devolver respuesta con nombre por defecto independientemente de parámetros', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        name: 'Juan Pérez',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        name: 'John Doe',
      })
    )
  })
}) 