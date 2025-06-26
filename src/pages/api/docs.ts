import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'SimpleFactura API',
      description: 'API para gestión de facturas con análisis estadístico avanzado',
      version: '1.0.0',
      contact: {
        name: 'SimpleFactura',
        email: 'support@simplefactura.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://simplefactura.com/api' 
          : 'http://localhost:3000/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'Session token from NextAuth.js'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detailed error information'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Category unique identifier'
            },
            name: {
              type: 'string',
              description: 'Category name',
              minLength: 2,
              maxLength: 100
            },
            description: {
              type: 'string',
              description: 'Category description',
              maxLength: 500
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['name']
        },
        Invoice: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Invoice unique identifier'
            },
            authorization_code: {
              type: 'string',
              description: 'Authorization code from tax authority'
            },
            name: {
              type: 'string',
              description: 'Invoice name/description',
              minLength: 2
            },
            nit: {
              type: 'string',
              pattern: '^\\d{7,11}$',
              description: 'Tax identification number (7-11 digits)'
            },
            nit_ci_cex: {
              type: 'string',
              pattern: '^\\d{7,11}$',
              description: 'Tax ID, Identity Card, or Foreigner Card'
            },
            number_receipt: {
              type: 'string',
              description: 'Receipt number',
              minLength: 1
            },
            purchase_date: {
              type: 'string',
              format: 'date',
              description: 'Purchase date (cannot be future date)'
            },
            total_amount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Total amount (positive number)'
            },
            vendor: {
              type: 'string',
              description: 'Vendor/supplier name',
              minLength: 2
            },
            rubro: {
              type: 'string',
              description: 'Business sector/category',
              minLength: 2
            },
            categoryId: {
              type: 'string',
              description: 'Category ID reference'
            },
            category: {
              $ref: '#/components/schemas/Category'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['number_receipt', 'purchase_date', 'total_amount', 'vendor', 'rubro', 'categoryId']
        },
        InvoiceFilters: {
          type: 'object',
          properties: {
            start: {
              type: 'string',
              format: 'date',
              description: 'Start date filter'
            },
            end: {
              type: 'string',
              format: 'date',
              description: 'End date filter'
            },
            vendor: {
              type: 'string',
              description: 'Vendor name filter'
            },
            nit: {
              type: 'string',
              description: 'NIT filter'
            },
            categoryId: {
              type: 'string',
              description: 'Category ID filter'
            },
            minAmount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Minimum amount filter'
            },
            maxAmount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Maximum amount filter'
            }
          }
        },
        CashFlowPrediction: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
              description: 'Prediction date'
            },
            predictedAmount: {
              type: 'number',
              description: 'Predicted cash flow amount'
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confidence level (0-1)'
            },
            trend: {
              type: 'string',
              enum: ['increasing', 'decreasing', 'stable'],
              description: 'Trend direction'
            }
          }
        },
        PaymentPrediction: {
          type: 'object',
          properties: {
            vendor: {
              type: 'string',
              description: 'Vendor name'
            },
            nextPaymentDate: {
              type: 'string',
              format: 'date',
              description: 'Predicted next payment date'
            },
            predictedAmount: {
              type: 'number',
              description: 'Predicted payment amount'
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confidence level (0-1)'
            },
            paymentPattern: {
              type: 'string',
              enum: ['regular', 'irregular', 'seasonal'],
              description: 'Payment pattern type'
            }
          }
        },
        SeasonalAnalysis: {
          type: 'object',
          properties: {
            month: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
              description: 'Month number (1-12)'
            },
            averageSpending: {
              type: 'number',
              description: 'Average spending for the month'
            },
            trend: {
              type: 'string',
              enum: ['peak', 'low', 'normal'],
              description: 'Spending trend for the month'
            },
            recommendation: {
              type: 'string',
              description: 'Recommendation for the month'
            }
          }
        },
        SpendingInsight: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Category name'
            },
            currentMonth: {
              type: 'number',
              description: 'Current month spending'
            },
            previousMonth: {
              type: 'number',
              description: 'Previous month spending'
            },
            trend: {
              type: 'number',
              description: 'Percentage change trend'
            },
            prediction: {
              type: 'number',
              description: 'Predicted next month spending'
            },
            recommendation: {
              type: 'string',
              description: 'Recommendation based on trend'
            }
          }
        },
        RiskAssessment: {
          type: 'object',
          properties: {
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Overall risk level'
            },
            riskFactors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of identified risk factors'
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of recommendations'
            }
          }
        },
        AnalyticsResponse: {
          type: 'object',
          properties: {
            cashFlowPredictions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CashFlowPrediction'
              }
            },
            paymentPredictions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/PaymentPrediction'
              }
            },
            seasonalAnalysis: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SeasonalAnalysis'
              }
            },
            spendingInsights: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SpendingInsight'
              }
            },
            riskAssessment: {
              $ref: '#/components/schemas/RiskAssessment'
            },
            dataPoints: {
              type: 'integer',
              description: 'Number of invoices analyzed'
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Last analysis update timestamp'
            }
          }
        },
        ExportRequest: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Start date for export'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'End date for export'
            },
            format: {
              type: 'string',
              enum: ['csv', 'pdf'],
              description: 'Export format'
            },
            vendor: {
              type: 'string',
              description: 'Filter by vendor'
            },
            nit: {
              type: 'string',
              description: 'Filter by NIT'
            },
            categoryId: {
              type: 'string',
              description: 'Filter by category ID'
            },
            minAmount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Minimum amount filter'
            },
            maxAmount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Maximum amount filter'
            }
          },
          required: ['startDate', 'endDate', 'format']
        },
        UserRegistration: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 8,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              description: 'Password (min 8 chars, must contain uppercase, lowercase, and number)'
            }
          },
          required: ['name', 'email', 'password']
        },
        UserLogin: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          },
          required: ['email', 'password']
        }
      }
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Create a new user account with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserRegistration'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Usuario registrado exitosamente'
                      },
                      user: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '409': {
              description: 'User already exists',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Authenticate user with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserLogin'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Inicio de sesión exitoso'
                      },
                      user: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get all categories',
          description: 'Retrieve all categories for the authenticated user',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': {
              description: 'Categories retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Category'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Categories'],
          summary: 'Create a new category',
          description: 'Create a new category for the authenticated user',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 2,
                      maxLength: 100
                    },
                    description: {
                      type: 'string',
                      maxLength: 500
                    }
                  },
                  required: ['name']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Category created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Category'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/categories/{id}': {
        get: {
          tags: ['Categories'],
          summary: 'Get category by ID',
          description: 'Retrieve a specific category by ID',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Category ID'
            }
          ],
          responses: {
            '200': {
              description: 'Category retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Category'
                  }
                }
              }
            },
            '404': {
              description: 'Category not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Categories'],
          summary: 'Update category',
          description: 'Update an existing category',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Category ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      minLength: 2,
                      maxLength: 100
                    },
                    description: {
                      type: 'string',
                      maxLength: 500
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Category updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Category'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Category not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Categories'],
          summary: 'Delete category',
          description: 'Delete a category (only if no invoices are associated)',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Category ID'
            }
          ],
          responses: {
            '200': {
              description: 'Category deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Categoría eliminada correctamente'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Cannot delete category with associated invoices',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Category not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/invoices': {
        get: {
          tags: ['Invoices'],
          summary: 'Get all invoices',
          description: 'Retrieve all invoices for the authenticated user with optional filters',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'start',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'Start date filter'
            },
            {
              name: 'end',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'End date filter'
            },
            {
              name: 'vendor',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Vendor name filter'
            },
            {
              name: 'nit',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'NIT filter'
            },
            {
              name: 'categoryId',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Category ID filter'
            },
            {
              name: 'minAmount',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Minimum amount filter'
            },
            {
              name: 'maxAmount',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Maximum amount filter'
            }
          ],
          responses: {
            '200': {
              description: 'Invoices retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Invoice'
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid filter parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Invoices'],
          summary: 'Create a new invoice',
          description: 'Create a new invoice for the authenticated user',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Invoice'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Invoice created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Invoice'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/invoices/{id}': {
        get: {
          tags: ['Invoices'],
          summary: 'Get invoice by ID',
          description: 'Retrieve a specific invoice by ID',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Invoice ID'
            }
          ],
          responses: {
            '200': {
              description: 'Invoice retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Invoice'
                  }
                }
              }
            },
            '404': {
              description: 'Invoice not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ['Invoices'],
          summary: 'Update invoice',
          description: 'Update an existing invoice',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Invoice ID'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Invoice'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Invoice updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Invoice'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Invoice not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ['Invoices'],
          summary: 'Delete invoice',
          description: 'Delete an invoice',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Invoice ID'
            }
          ],
          responses: {
            '200': {
              description: 'Invoice deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Factura eliminada correctamente'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Invoice not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/invoices/export': {
        post: {
          tags: ['Invoices'],
          summary: 'Export invoices',
          description: 'Export invoices to CSV or PDF format with filters',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExportRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Export successful',
              content: {
                'application/pdf': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  },
                  description: 'PDF file'
                },
                'text/csv': {
                  schema: {
                    type: 'string'
                  },
                  description: 'CSV file'
                }
              }
            },
            '400': {
              description: 'Invalid export parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'No invoices found for export',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/invoices/ocr': {
        post: {
          tags: ['Invoices'],
          summary: 'OCR invoice processing',
          description: 'Process invoice image using OCR to extract data',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'string',
                      format: 'binary',
                      description: 'Invoice image file'
                    }
                  },
                  required: ['image']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'OCR processing successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      extractedData: {
                        $ref: '#/components/schemas/Invoice'
                      },
                      confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'OCR confidence level'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid image or processing error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/analytics/predictions': {
        get: {
          tags: ['Analytics'],
          summary: 'Get statistical analysis',
          description: 'Retrieve advanced statistical analysis including cash flow projections, payment patterns, and risk assessment',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': {
              description: 'Statistical analysis retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AnalyticsResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/stats': {
        get: {
          tags: ['Statistics'],
          summary: 'Get basic statistics',
          description: 'Retrieve basic invoice statistics and charts data',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': {
              description: 'Statistics retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      summary: {
                        type: 'object',
                        properties: {
                          totalInvoices: {
                            type: 'integer'
                          },
                          totalAmount: {
                            type: 'number'
                          },
                          averageAmount: {
                            type: 'number'
                          },
                          totalTax: {
                            type: 'number'
                          }
                        }
                      },
                      weeklyData: {
                        type: 'array',
                        items: {
                          type: 'object'
                        }
                      },
                      monthlyData: {
                        type: 'array',
                        items: {
                          type: 'object'
                        }
                      },
                      categoryData: {
                        type: 'array',
                        items: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/test/generate-sample-data': {
        post: {
          tags: ['Testing'],
          summary: 'Generate sample data',
          description: 'Generate sample categories and invoices for testing (only for users with no existing data)',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': {
              description: 'Sample data generated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Datos de muestra generados exitosamente'
                      },
                      categoriesCreated: {
                        type: 'integer',
                        description: 'Number of categories created'
                      },
                      invoicesCreated: {
                        type: 'integer',
                        description: 'Number of invoices created'
                      },
                      totalAmount: {
                        type: 'number',
                        description: 'Total amount of created invoices'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'User already has data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints'
      },
      {
        name: 'Categories',
        description: 'Invoice category management endpoints'
      },
      {
        name: 'Invoices',
        description: 'Invoice management and processing endpoints'
      },
      {
        name: 'Analytics',
        description: 'Advanced statistical analysis endpoints'
      },
      {
        name: 'Statistics',
        description: 'Basic statistics and reporting endpoints'
      },
      {
        name: 'Testing',
        description: 'Testing and development endpoints'
      }
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerDocument);
} 