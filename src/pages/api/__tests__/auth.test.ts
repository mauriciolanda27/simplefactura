import { validationSchemas } from '../../../utils/validation';

describe('Authentication Validation', () => {
  describe('User Registration Schema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const result = validationSchemas.userRegistration.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject registration with short name', () => {
      const invalidData = {
        name: 'T',
        email: 'test@example.com',
        password: 'Password123'
      };

      const result = validationSchemas.userRegistration.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('al menos 2 caracteres');
      }
    });

    it('should reject registration with invalid email', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123'
      };

      const result = validationSchemas.userRegistration.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email inválido');
      }
    });

    it('should reject registration with weak password', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      const result = validationSchemas.userRegistration.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('al menos 8 caracteres');
      }
    });

    it('should reject registration with missing fields', () => {
      const invalidData = {
        name: 'Test User',
        // Missing email and password
      };

      const result = validationSchemas.userRegistration.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('User Login Schema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const result = validationSchemas.userLogin.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject login with invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123'
      };

      const result = validationSchemas.userLogin.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email inválido');
      }
    });

    it('should reject login with empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      const result = validationSchemas.userLogin.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña es obligatoria');
      }
    });
  });

  describe('Invoice Schema', () => {
    it('should validate correct invoice data', () => {
      const validData = {
        number_receipt: 'INV-001',
        purchase_date: '2024-01-15',
        vendor: 'Test Vendor',
        nit: '123456789',
        nit_ci_cex: '987654321',
        rubro: 'Test service',
        total_amount: '1000.00',
        authorization_code: 'AUTH-123',
        categoryId: '1'
      };

      const result = validationSchemas.invoice.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invoice with negative total', () => {
      const invalidData = {
        number_receipt: 'INV-001',
        purchase_date: '2024-01-15',
        vendor: 'Test Vendor',
        nit: '123456789',
        nit_ci_cex: '987654321',
        rubro: 'Test service',
        total_amount: '-100.00', // Negative
        authorization_code: 'AUTH-123',
        categoryId: '1'
      };

      const result = validationSchemas.invoice.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Category Schema', () => {
    it('should validate correct category data', () => {
      const validData = {
        name: 'Test Category',
        description: 'Test description'
      };

      const result = validationSchemas.category.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject category with short name', () => {
      const invalidData = {
        name: 'T', // Too short
        description: 'Test description'
      };

      const result = validationSchemas.category.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
}); 