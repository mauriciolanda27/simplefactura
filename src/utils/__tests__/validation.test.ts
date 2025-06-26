import { isValidEmail, isValidAmount, isValidNIT } from '../validation'

describe('Validación de Datos', () => {
  describe('isValidEmail', () => {
    it('debe aceptar emails válidos', () => {
      const emailsValidos = [
        'usuario@ejemplo.com',
        'admin@simplefactura.com',
        'test@dominio.co.bo',
        'usuario+tag@ejemplo.org'
      ]

      emailsValidos.forEach(email => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('debe rechazar emails inválidos', () => {
      const emailsInvalidos = [
        'email-invalido',
        '@ejemplo.com',
        'usuario@',
        'usuario@.com',
        '',
        '   '
      ]

      emailsInvalidos.forEach(email => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('isValidAmount', () => {
    it('debe aceptar montos válidos', () => {
      const montosValidos = [
        '100',
        '1500.50',
        '0.01',
        '999999.99'
      ]

      montosValidos.forEach(monto => {
        expect(isValidAmount(monto)).toBe(true)
      })
    })

    it('debe rechazar montos inválidos', () => {
      const montosInvalidos = [
        '0',
        '-100',
        'abc',
        '100.123',
        '',
        '   '
      ]

      montosInvalidos.forEach(monto => {
        expect(isValidAmount(monto)).toBe(false)
      })
    })
  })

  describe('isValidNIT', () => {
    it('debe aceptar NITs válidos', () => {
      const nitsValidos = [
        '1234567',
        '12345678901',
        '9876543',
        '1234567890'
      ]

      nitsValidos.forEach(nit => {
        expect(isValidNIT(nit)).toBe(true)
      })
    })

    it('debe rechazar NITs inválidos', () => {
      const nitsInvalidos = [
        '123456',
        '123456789012',
        'abc123',
        '',
        '   '
      ]

      nitsInvalidos.forEach(nit => {
        expect(isValidNIT(nit)).toBe(false)
      })
    })
  })
}) 