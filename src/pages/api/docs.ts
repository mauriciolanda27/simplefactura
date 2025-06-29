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
        },
        UserSettings: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Settings unique identifier'
            },
            userId: {
              type: 'string',
              description: 'User ID reference'
            },
            theme: {
              type: 'string',
              enum: ['light', 'dark', 'auto'],
              description: 'User interface theme preference'
            },
            language: {
              type: 'string',
              enum: ['es', 'en'],
              description: 'User language preference'
            },
            notifications: {
              type: 'boolean',
              description: 'Enable/disable system notifications'
            },
            export_format: {
              type: 'string',
              enum: ['csv', 'pdf'],
              description: 'Default export format preference'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Settings creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Settings last update timestamp'
            }
          }
        },
        ReportFilters: {
          type: 'object',
          properties: {
            dateFrom: {
              type: 'string',
              format: 'date',
              description: 'Start date for report'
            },
            dateTo: {
              type: 'string',
              format: 'date',
              description: 'End date for report'
            },
            category: {
              type: 'string',
              description: 'Filter by category name'
            },
            vendor: {
              type: 'string',
              description: 'Filter by vendor name'
            },
            rubro: {
              type: 'string',
              description: 'Filter by business sector'
            },
            minAmount: {
              type: 'number',
              description: 'Minimum amount filter'
            },
            maxAmount: {
              type: 'number',
              description: 'Maximum amount filter'
            },
            reportType: {
              type: 'string',
              enum: ['summary', 'detailed'],
              description: 'Type of report to generate'
            }
          }
        },
        ReportData: {
          type: 'object',
          properties: {
            invoices: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Invoice'
              },
              description: 'List of invoices matching filters'
            },
            summary: {
              type: 'object',
              properties: {
                totalInvoices: {
                  type: 'integer',
                  description: 'Total number of invoices'
                },
                totalAmount: {
                  type: 'string',
                  description: 'Total amount as formatted string'
                },
                averageAmount: {
                  type: 'string',
                  description: 'Average amount per invoice'
                },
                totalTax: {
                  type: 'string',
                  description: 'Total tax amount (13%)'
                },
                periodStart: {
                  type: 'string',
                  description: 'Report period start date'
                },
                periodEnd: {
                  type: 'string',
                  description: 'Report period end date'
                }
              }
            },
            topPerformers: {
              type: 'object',
              properties: {
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      },
                      amount: {
                        type: 'number'
                      },
                      count: {
                        type: 'integer'
                      }
                    }
                  }
                },
                vendors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      },
                      amount: {
                        type: 'number'
                      },
                      count: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            },
            filters: {
              $ref: '#/components/schemas/ReportFilters'
            },
            exportDate: {
              type: 'string',
              format: 'date',
              description: 'Date when report was generated'
            }
          }
        },
        ExportHistory: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Export history unique identifier'
            },
            userId: {
              type: 'string',
              description: 'User ID reference'
            },
            export_type: {
              type: 'string',
              enum: ['invoice', 'report'],
              description: 'Type of export performed'
            },
            format: {
              type: 'string',
              enum: ['csv', 'pdf'],
              description: 'Export format used'
            },
            filename: {
              type: 'string',
              description: 'Name of exported file'
            },
            file_size: {
              type: 'integer',
              description: 'Size of exported file in bytes'
            },
            filters: {
              type: 'object',
              description: 'Filters applied during export'
            },
            status: {
              type: 'string',
              enum: ['completed', 'failed', 'cancelled'],
              description: 'Export status'
            },
            error_message: {
              type: 'string',
              description: 'Error details if export failed'
            },
            retry_count: {
              type: 'integer',
              description: 'Number of retry attempts'
            },
            download_count: {
              type: 'integer',
              description: 'Number of times file was downloaded'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Export creation timestamp'
            },
            completed_at: {
              type: 'string',
              format: 'date-time',
              description: 'Export completion timestamp'
            }
          }
        },
        OCRResponse: {
          type: 'object',
          properties: {
            authorization_code: {
              type: 'string',
              description: 'Extracted authorization code'
            },
            name: {
              type: 'string',
              description: 'Extracted company name'
            },
            nit: {
              type: 'string',
              description: 'Extracted NIT'
            },
            nit_ci_cex: {
              type: 'string',
              description: 'Extracted NIT/CI/CEX'
            },
            number_receipt: {
              type: 'string',
              description: 'Extracted receipt number'
            },
            purchase_date: {
              type: 'string',
              description: 'Extracted purchase date'
            },
            total_amount: {
              type: 'string',
              description: 'Extracted total amount'
            },
            vendor: {
              type: 'string',
              description: 'Extracted vendor name'
            }
          }
        }
      }
    },
    paths: {
      '/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Create a new user account with email and password. Note: Login is handled by NextAuth.js, not a separate endpoint.',
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
          description: 'Process invoice image using OCR to extract data automatically. Supports JPG, PNG, and PDF formats up to 10MB.',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fileContent: {
                      type: 'string',
                      format: 'base64',
                      description: 'Base64 encoded image or PDF file content'
                    },
                    fileName: {
                      type: 'string',
                      description: 'Original filename with extension'
                    }
                  },
                  required: ['fileContent', 'fileName']
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
                    $ref: '#/components/schemas/OCRResponse'
                  },
                  examples: {
                    'success': {
                      summary: 'Successful OCR extraction',
                      value: {
                        authorization_code: "1234567890123",
                        name: "EMPRESA EJEMPLO S.A.",
                        nit: "1234567890",
                        nit_ci_cex: "1234567890",
                        number_receipt: "A-001-001-00000001",
                        purchase_date: "2024-01-15",
                        total_amount: "1500.00",
                        vendor: "PROVEEDOR ABC"
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid file or processing error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  },
                  examples: {
                    'invalid_file': {
                      summary: 'Invalid file format',
                      value: {
                        error: "Formato de archivo no soportado. Use JPG, PNG o PDF."
                      }
                    },
                    'file_too_large': {
                      summary: 'File too large',
                      value: {
                        error: "El archivo excede el tamaño máximo de 10MB."
                      }
                    },
                    'ocr_failed': {
                      summary: 'OCR processing failed',
                      value: {
                        error: "No se pudo procesar el documento. Verifique que la imagen sea clara y legible."
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
            },
            '500': {
              description: 'OCR service error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  },
                  examples: {
                    'service_error': {
                      summary: 'OCR service unavailable',
                      value: {
                        error: "Servicio OCR temporalmente no disponible. Intente más tarde."
                      }
                    }
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
          description: 'Retrieve advanced statistical analysis including cash flow projections, payment patterns, seasonal analysis, spending insights, and risk assessment. Requires sufficient data for accurate predictions.',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': {
              description: 'Statistical analysis retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AnalyticsResponse'
                  },
                  examples: {
                    'full_analysis': {
                      summary: 'Complete analysis with all predictions',
                      value: {
                        cashFlowPredictions: [
                          {
                            date: "2024-02-01",
                            predictedAmount: 12500.50,
                            confidence: 0.85,
                            trend: "increasing"
                          }
                        ],
                        paymentPredictions: [
                          {
                            vendor: "PROVEEDOR ABC",
                            nextPaymentDate: "2024-02-15",
                            predictedAmount: 2500.00,
                            confidence: 0.78,
                            paymentPattern: "regular"
                          }
                        ],
                        seasonalAnalysis: [
                          {
                            month: 12,
                            averageSpending: 18000.00,
                            trend: "peak",
                            recommendation: "Aumentar presupuesto para gastos de fin de año"
                          }
                        ],
                        spendingInsights: [
                          {
                            category: "Servicios",
                            currentMonth: 8500.00,
                            previousMonth: 7200.00,
                            trend: 18.06,
                            prediction: 9200.00,
                            recommendation: "Considerar optimización de servicios contratados"
                          }
                        ],
                        riskAssessment: {
                          riskLevel: "medium",
                          riskFactors: [
                            "Gastos concentrados en pocos proveedores",
                            "Tendencia de aumento en servicios"
                          ],
                          recommendations: [
                            "Diversificar proveedores",
                            "Revisar contratos de servicios"
                          ]
                        },
                        dataPoints: 156,
                        lastUpdated: "2024-01-15T10:30:00.000Z"
                      }
                    },
                    'insufficient_data': {
                      summary: 'Analysis with insufficient data',
                      value: {
                        cashFlowPredictions: [],
                        paymentPredictions: [],
                        seasonalAnalysis: [],
                        spendingInsights: [],
                        riskAssessment: {
                          riskLevel: "unknown",
                          riskFactors: ["Datos insuficientes para análisis"],
                          recommendations: ["Agregar más facturas para análisis preciso"]
                        },
                        dataPoints: 5,
                        lastUpdated: "2024-01-15T10:30:00.000Z"
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
            },
            '422': {
              description: 'Insufficient data for analysis',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  },
                  examples: {
                    'insufficient_data': {
                      summary: 'Not enough data for predictions',
                      value: {
                        error: "Se requieren al menos 10 facturas para generar análisis predictivo"
                      }
                    }
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
          description: 'Retrieve basic invoice statistics, charts data, and summary metrics for the authenticated user',
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
                            type: 'integer',
                            description: 'Total number of invoices'
                          },
                          totalAmount: {
                            type: 'number',
                            description: 'Total amount of all invoices'
                          },
                          averageAmount: {
                            type: 'number',
                            description: 'Average amount per invoice'
                          },
                          totalTax: {
                            type: 'number',
                            description: 'Total tax amount (13%)'
                          }
                        }
                      },
                      weeklyData: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            week: {
                              type: 'string',
                              description: 'Week identifier'
                            },
                            amount: {
                              type: 'number',
                              description: 'Total amount for the week'
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of invoices for the week'
                            }
                          }
                        },
                        description: 'Weekly spending data for charts'
                      },
                      monthlyData: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            month: {
                              type: 'string',
                              description: 'Month identifier'
                            },
                            amount: {
                              type: 'number',
                              description: 'Total amount for the month'
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of invoices for the month'
                            }
                          }
                        },
                        description: 'Monthly spending data for charts'
                      },
                      categoryData: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            category: {
                              type: 'string',
                              description: 'Category name'
                            },
                            amount: {
                              type: 'number',
                              description: 'Total amount for the category'
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of invoices for the category'
                            }
                          }
                        },
                        description: 'Category spending data for charts'
                      },
                      vendorData: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            vendor: {
                              type: 'string',
                              description: 'Vendor name'
                            },
                            amount: {
                              type: 'number',
                              description: 'Total amount for the vendor'
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of invoices for the vendor'
                            }
                          }
                        },
                        description: 'Vendor spending data for charts'
                      },
                      rubroData: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            rubro: {
                              type: 'string',
                              description: 'Business sector name'
                            },
                            amount: {
                              type: 'number',
                              description: 'Total amount for the sector'
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of invoices for the sector'
                            }
                          }
                        },
                        description: 'Business sector spending data for charts'
                      },
                      trends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            period: {
                              type: 'string',
                              description: 'Period identifier'
                            },
                            growth: {
                              type: 'number',
                              description: 'Growth percentage'
                            }
                          }
                        },
                        description: 'Growth trends data'
                      },
                      comparisons: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            metric: {
                              type: 'string',
                              description: 'Metric name'
                            },
                            current: {
                              type: 'number',
                              description: 'Current period value'
                            },
                            previous: {
                              type: 'number',
                              description: 'Previous period value'
                            },
                            change: {
                              type: 'number',
                              description: 'Percentage change'
                            }
                          }
                        },
                        description: 'Period comparison data'
                      },
                      topCategories: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                              description: 'Category name'
                            },
                            amount: {
                              type: 'number',
                              description: 'Total amount'
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of invoices'
                            }
                          }
                        },
                        description: 'Top spending categories'
                      },
                      topRubros: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                              description: 'Business sector name'
                            },
                            amount: {
                              type: 'number',
                              description: 'Total amount'
                            },
                            count: {
                              type: 'integer',
                              description: 'Number of invoices'
                            }
                          }
                        },
                        description: 'Top spending business sectors'
                      }
                    }
                  },
                  examples: {
                    'with_data': {
                      summary: 'Statistics with data',
                      value: {
                        summary: {
                          totalInvoices: 156,
                          totalAmount: 125000.50,
                          averageAmount: 801.28,
                          totalTax: 14380.58
                        },
                        weeklyData: [
                          {
                            week: "Sem 1",
                            amount: 8500.00,
                            count: 12
                          }
                        ],
                        monthlyData: [
                          {
                            month: "Ene 2024",
                            amount: 25000.00,
                            count: 35
                          }
                        ],
                        categoryData: [
                          {
                            category: "Servicios",
                            amount: 45000.00,
                            count: 45
                          }
                        ],
                        vendorData: [
                          {
                            vendor: "PROVEEDOR ABC",
                            amount: 18000.00,
                            count: 25
                          }
                        ],
                        rubroData: [
                          {
                            rubro: "Tecnología",
                            amount: 32000.00,
                            count: 28
                          }
                        ],
                        trends: [
                          {
                            period: "Último mes",
                            growth: 15.5
                          }
                        ],
                        comparisons: [
                          {
                            metric: "Total Gastos",
                            current: 25000.00,
                            previous: 21645.00,
                            change: 15.5
                          }
                        ],
                        topCategories: [
                          {
                            name: "Servicios",
                            amount: 45000.00,
                            count: 45
                          }
                        ],
                        topRubros: [
                          {
                            name: "Tecnología",
                            amount: 32000.00,
                            count: 28
                          }
                        ]
                      }
                    },
                    'no_data': {
                      summary: 'Statistics with no data',
                      value: {
                        summary: {
                          totalInvoices: 0,
                          totalAmount: 0,
                          averageAmount: 0,
                          totalTax: 0
                        },
                        weeklyData: [],
                        monthlyData: [],
                        categoryData: [],
                        vendorData: [],
                        rubroData: [],
                        trends: [],
                        comparisons: [],
                        topCategories: [],
                        topRubros: []
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
          description: 'Generate sample categories and invoices for testing purposes. Only works for users with no existing data. Creates realistic data with seasonal patterns and multiple vendors.',
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
                        description: 'Number of categories created',
                        minimum: 0
                      },
                      invoicesCreated: {
                        type: 'integer',
                        description: 'Number of invoices created',
                        minimum: 0
                      },
                      totalAmount: {
                        type: 'number',
                        description: 'Total amount of created invoices',
                        minimum: 0
                      },
                      dataDetails: {
                        type: 'object',
                        properties: {
                          categories: {
                            type: 'array',
                            items: {
                              type: 'string'
                            },
                            description: 'Names of created categories'
                          },
                          vendors: {
                            type: 'array',
                            items: {
                              type: 'string'
                            },
                            description: 'Names of vendors used in invoices'
                          },
                          dateRange: {
                            type: 'object',
                            properties: {
                              start: {
                                type: 'string',
                                format: 'date'
                              },
                              end: {
                                type: 'string',
                                format: 'date'
                              }
                            },
                            description: 'Date range of generated invoices'
                          }
                        }
                      }
                    }
                  },
                  examples: {
                    'success': {
                      summary: 'Sample data generated successfully',
                      value: {
                        message: "Datos de muestra generados exitosamente",
                        categoriesCreated: 6,
                        invoicesCreated: 84,
                        totalAmount: 125000.50,
                        dataDetails: {
                          categories: [
                            "Servicios Básicos",
                            "Tecnología",
                            "Materiales",
                            "Equipos",
                            "Servicios Profesionales",
                            "Gastos Operativos"
                          ],
                          vendors: [
                            "PROVEEDOR ABC",
                            "DISTRIBUIDORA XYZ",
                            "SERVICIOS TÉCNICOS",
                            "SUMINISTROS GENERALES",
                            "TECNOLOGÍA AVANZADA"
                          ],
                          dateRange: {
                            start: "2023-01-01",
                            end: "2024-01-15"
                          }
                        }
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
                  },
                  examples: {
                    'existing_data': {
                      summary: 'User already has data',
                      value: {
                        error: "El usuario ya tiene datos existentes. Solo se puede generar datos de muestra para usuarios sin datos."
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
            },
            '500': {
              description: 'Error generating sample data',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  },
                  examples: {
                    'generation_error': {
                      summary: 'Error during data generation',
                      value: {
                        error: "Error al generar datos de muestra. Intente nuevamente."
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/user-settings': {
        get: {
          tags: ['User Settings'],
          summary: 'Get user settings',
          description: 'Retrieve user preferences and configuration settings. Note: Currently only theme is used in the UI, other settings are stored but not exposed in the frontend.',
          security: [{ sessionAuth: [] }],
          responses: {
            '200': {
              description: 'User settings retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserSettings'
                  },
                  examples: {
                    'current_implementation': {
                      summary: 'Current implementation (only theme used)',
                      value: {
                        id: 'clx1234567894',
                        userId: 'clx1234567890',
                        theme: 'light',
                        language: 'es',
                        notifications: true,
                        export_format: 'csv',
                        created_at: '2024-01-15T10:30:00.000Z',
                        updated_at: '2024-01-15T10:30:00.000Z'
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
        },
        put: {
          tags: ['User Settings'],
          summary: 'Update user settings',
          description: 'Update user preferences and configuration settings. Note: Currently only theme is used in the UI, other settings are stored but not exposed in the frontend.',
          security: [{ sessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    theme: {
                      type: 'string',
                      enum: ['light', 'dark'],
                      description: 'User interface theme preference (currently the only setting used in UI)'
                    },
                    language: {
                      type: 'string',
                      enum: ['es', 'en'],
                      description: 'User language preference (stored but not used in current UI)'
                    },
                    notifications: {
                      type: 'boolean',
                      description: 'Enable/disable system notifications (stored but not used in current UI)'
                    },
                    export_format: {
                      type: 'string',
                      enum: ['csv', 'pdf'],
                      description: 'Default export format preference (stored but not used in current UI)'
                    }
                  }
                },
                examples: {
                  'update_theme_only': {
                    summary: 'Update theme only (current UI usage)',
                    value: {
                      theme: 'dark'
                    }
                  },
                  'update_all_settings': {
                    summary: 'Update all settings (stored but not used in UI)',
                    value: {
                      theme: 'dark',
                      language: 'en',
                      notifications: false,
                      export_format: 'pdf'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'User settings updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserSettings'
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
            },
            '500': {
              description: 'Internal server error',
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
      '/reports/export': {
        get: {
          tags: ['Reports'],
          summary: 'Export reports',
          description: 'Export reports to CSV or PDF format with advanced filtering options',
          security: [{ sessionAuth: [] }],
          parameters: [
            {
              name: 'dateFrom',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'Start date for report'
            },
            {
              name: 'dateTo',
              in: 'query',
              schema: {
                type: 'string',
                format: 'date'
              },
              description: 'End date for report'
            },
            {
              name: 'category',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Filter by category name'
            },
            {
              name: 'vendor',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Filter by vendor name'
            },
            {
              name: 'rubro',
              in: 'query',
              schema: {
                type: 'string'
              },
              description: 'Filter by business sector'
            },
            {
              name: 'minAmount',
              in: 'query',
              schema: {
                type: 'number'
              },
              description: 'Minimum amount filter'
            },
            {
              name: 'maxAmount',
              in: 'query',
              schema: {
                type: 'number'
              },
              description: 'Maximum amount filter'
            },
            {
              name: 'reportType',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['summary', 'detailed']
              },
              description: 'Type of report to generate'
            },
            {
              name: 'format',
              in: 'query',
              required: true,
              schema: {
                type: 'string',
                enum: ['csv', 'pdf']
              },
              description: 'Export format'
            }
          ],
          responses: {
            '200': {
              description: 'Report exported successfully',
              content: {
                'application/pdf': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  },
                  description: 'PDF report file'
                },
                'text/csv': {
                  schema: {
                    type: 'string'
                  },
                  description: 'CSV report file'
                },
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ReportData'
                  },
                  description: 'Report data for PDF generation'
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
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'No data found for export',
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
      },
      {
        name: 'User Settings',
        description: 'User settings management endpoints'
      },
      {
        name: 'Reports',
        description: 'Report generation and export endpoints'
      }
    ]
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerDocument);
} 