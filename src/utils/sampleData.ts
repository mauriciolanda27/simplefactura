import { Invoice, Category, Rubro } from '@prisma/client';

// Generate sample invoice data for testing predictive analytics
export function generateSampleInvoices(categories: Category[], rubros: Rubro[], userId: string): Omit<Invoice, 'id' | 'created_at' | 'updated_at'>[] {
  const vendors = [
    'Proveedor A', 'Proveedor B', 'Proveedor C', 'Proveedor D', 'Proveedor E',
    'Servicios XYZ', 'Materiales ABC', 'Tecnología 123', 'Logística Plus', 'Consultoría Pro'
  ];

  const sampleInvoices: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>[] = [];
  
  // Generate invoices for the last 12 months with some patterns
  const now = new Date();
  
  for (let month = 11; month >= 0; month--) {
    const baseDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
    
    // Generate 3-8 invoices per month with seasonal patterns
    const invoicesThisMonth = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < invoicesThisMonth; i++) {
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const purchaseDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), randomDay);
      
      // Create seasonal spending patterns
      let baseAmount = 1000 + Math.random() * 5000;
      
      // Higher spending in certain months (e.g., December, March)
      if (month === 11) baseAmount *= 1.5; // December
      if (month === 2) baseAmount *= 1.3;  // March
      if (month === 5) baseAmount *= 1.2;  // June
      
      // Lower spending in other months
      if (month === 0) baseAmount *= 0.7;  // January
      if (month === 6) baseAmount *= 0.8;  // July
      
      const amount = Math.round(baseAmount + (Math.random() * 2000 - 1000));
      
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const rubro = rubros[Math.floor(Math.random() * rubros.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      sampleInvoices.push({
        authorization_code: `AUTH${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: `Factura ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        nit: (Math.floor(Math.random() * 9000000000) + 1000000000).toString(),
        nit_ci_cex: (Math.floor(Math.random() * 9000000000) + 1000000000).toString(),
        number_receipt: `REC${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        purchase_date: purchaseDate,
        total_amount: Math.max(100, amount),
        vendor,
        rubroId: rubro.id,
        categoryId: category.id,
        userId
      });
    }
  }
  
  return sampleInvoices;
}

// Generate sample categories
export function generateSampleCategories(userId: string): Omit<Category, 'id' | 'created_at' | 'updated_at'>[] {
  return [
    {
      name: 'Servicios Básicos',
      description: 'Servicios esenciales como agua, luz, gas',
      userId
    },
    {
      name: 'Tecnología',
      description: 'Equipos y servicios tecnológicos',
      userId
    },
    {
      name: 'Materiales',
      description: 'Materiales de oficina y suministros',
      userId
    },
    {
      name: 'Transporte',
      description: 'Servicios de transporte y logística',
      userId
    },
    {
      name: 'Consultoría',
      description: 'Servicios de consultoría profesional',
      userId
    },
    {
      name: 'Mantenimiento',
      description: 'Servicios de mantenimiento y reparación',
      userId
    }
  ];
} 