import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'

// Create a custom theme for testing
const testTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={testTheme}>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock data for tests
export const mockInvoice = {
  id: 1,
  invoiceNumber: 'INV-001',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  vendor: 'Proveedor Test',
  customer: 'Cliente Test',
  nit: '123456789',
  nitCICEX: '987654321',
  concept: 'Servicios de consultoría',
  total: 1500.00,
  authorizationCode: 'AUTH-123',
  categoryId: 1,
  category: {
    id: 1,
    name: 'Servicios',
    description: 'Categoría de servicios',
    color: '#1976d2',
  },
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

export const mockCategory = {
  id: 1,
  name: 'Servicios',
  description: 'Categoría de servicios',
  color: '#1976d2',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Usuario Test',
  image: null,
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
}

// Mock functions
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
} 