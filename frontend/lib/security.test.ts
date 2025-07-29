import {
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  isValidPhone,
  sanitizeFormData,
  generateSecureRandomString,
  isValidUrl,
} from './security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const input = 'test\u0000string';
      const result = sanitizeInput(input);
      expect(result).toBe('teststring');
    });

    it('should remove control characters', () => {
      const input = 'test\x01\x02\x03string';
      const result = sanitizeInput(input);
      expect(result).toBe('teststring');
    });

    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should trim whitespace', () => {
      const input = '  test string  ';
      const result = sanitizeInput(input);
      expect(result).toBe('test string');
    });

    it('should handle non-string input', () => {
      const input = 123;
      const result = sanitizeInput(input as unknown as string);
      expect(result).toBe(123);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should provide specific error messages', () => {
      const result = validatePasswordStrength('password');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('isValidPhone', () => {
    it('should validate Vietnamese phone numbers', () => {
      expect(isValidPhone('0123456789')).toBe(true);
      expect(isValidPhone('0987654321')).toBe(true);
      expect(isValidPhone('+84123456789')).toBe(true);
      expect(isValidPhone('84123456789')).toBe(true);
      expect(isValidPhone('0912345678')).toBe(true);
      expect(isValidPhone('0812345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123456789')).toBe(false);
      expect(isValidPhone('012345678')).toBe(false);
      expect(isValidPhone('01234567890')).toBe(false);
      expect(isValidPhone('invalid')).toBe(false);
    });

    it('should handle phone numbers with spaces', () => {
      expect(isValidPhone('0123 456 789')).toBe(true);
      expect(isValidPhone('0987 654 321')).toBe(true);
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize nested objects', () => {
      const data = {
        name: '  Test<script>alert("xss")</script>  ',
        email: 'test@example.com',
        address: {
          street: ' 123 Main St<script>alert("xss")</script> ',
          city: 'City',
        },
      };

      const result = sanitizeFormData(data);
      expect(result.name).toBe('Test&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result.email).toBe('test@example.com');
      expect(result.address.street).toBe('123 Main St&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result.address.city).toBe('City');
    });

    it('should handle arrays', () => {
      const data = {
        tags: ['tag1', '  tag2<script>alert("xss")</script>  ', 'tag3'],
      };

      const result = sanitizeFormData(data);
      expect(result.tags[0]).toBe('tag1');
      expect(result.tags[1]).toBe('tag2&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result.tags[2]).toBe('tag3');
    });

    it('should preserve non-string values', () => {
      const data = {
        number: 123,
        boolean: true,
        null: null,
        undefined: undefined,
      };

      const result = sanitizeFormData(data);
      expect(result.number).toBe(123);
      expect(result.boolean).toBe(true);
      expect(result.null).toBe(null);
      expect(result.undefined).toBe(undefined);
    });
  });

  describe('generateSecureRandomString', () => {
    it('should generate string of specified length', () => {
      const result = generateSecureRandomString(16);
      expect(result).toHaveLength(16);
      expect(typeof result).toBe('string');
    });

    it('should generate different strings on each call', () => {
      const result1 = generateSecureRandomString(10);
      const result2 = generateSecureRandomString(10);
      expect(result1).not.toBe(result2);
    });

    it('should use default length when not specified', () => {
      const result = generateSecureRandomString();
      expect(result).toHaveLength(32);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://api.example.com/path?param=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
}); 