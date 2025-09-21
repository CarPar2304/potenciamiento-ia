// Mock data for the application

export const mockChambers = [
  'Cámara de Comercio de Cali',
  'Cámara de Comercio de Popayán',
  'Cámara de Comercio de Buenaventura',
  'Cámara de Comercio de Palmira',
  'Cámara de Comercio de Buga',
  'Cámara de Comercio de Tuluá',
  'Cámara de Comercio de Cartago',
  'Cámara de Comercio del Cauca',
  'Cámara de Comercio de Nariño',
  'Cámara de Comercio del Huila',
  'Cámara de Comercio del Putumayo'
];

export const mockSectors = [
  'Tecnología',
  'Comercio',
  'Manufactura',
  'Servicios',
  'Agricultura',
  'Turismo',
  'Construcción',
  'Transporte',
  'Educación',
  'Salud'
];

export const mockApplications = Array.from({ length: 250 }, (_, i) => ({
  id: `app-${i + 1}`,
  firstName: ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Sofía', 'Diego', 'Isabella'][i % 10],
  lastName: ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores'][i % 10],
  email: `usuario${i + 1}@empresa${i + 1}.com`,
  document: `12345${String(i + 1).padStart(3, '0')}`,
  phone: `+57 3${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
  chamber: mockChambers[i % mockChambers.length],
  company: `Empresa ${i + 1} SAS`,
  nit: `9001234${String(i + 1).padStart(3, '0')}-${i % 9 + 1}`,
  sector: mockSectors[i % mockSectors.length],
  status: ['pendiente', 'aprobado', 'rechazado', 'en_proceso'][Math.floor(Math.random() * 4)],
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  employees: Math.floor(Math.random() * 500) + 1,
  sales2024: Math.floor(Math.random() * 5000000000) + 100000000,
  hasAI: Math.random() > 0.6,
  aiInvestment2024: Math.random() > 0.5 ? Math.floor(Math.random() * 100000000) : 0,
  aiAdoptionProbability: Math.floor(Math.random() * 5) + 1,
  testCompleted: Math.random() > 0.3,
  platziLevel: Math.random() > 0.3 ? Math.floor(Math.random() * 6) + 1 : null,
  progress: Math.random() > 0.3 ? Math.floor(Math.random() * 100) : 0,
}));

export const mockCompanies = Array.from(new Set(mockApplications.map(app => app.nit)))
  .map(nit => {
    const app = mockApplications.find(a => a.nit === nit)!;
    return {
      nit: app.nit,
      name: app.company,
      chamber: app.chamber,
      sector: app.sector,
      employees: app.employees,
      sales2024: app.sales2024,
      hasAI: app.hasAI,
      aiInvestment2024: app.aiInvestment2024,
    };
  });

export const mockInteractions = [
  {
    id: '1',
    chamber: 'Cámara de Comercio de Popayán',
    type: 'reunion',
    date: '2024-01-15',
    title: 'Reunión inicial de socialización',
    description: 'Primera reunión para presentar el programa de adopción de IA',
    responsible: 'Carlos Rodríguez',
    status: 'socializada',
  },
  {
    id: '2',
    chamber: 'Cámara de Comercio de Buenaventura',
    type: 'correo',
    date: '2024-01-10',
    title: 'Envío de documentación inicial',
    description: 'Documentos sobre el programa y requisitos para participar',
    responsible: 'María González',
    status: 'no_contactada',
  },
  // Add more mock interactions...
];

export const mockInsights = [
  {
    id: '1',
    title: 'Nuevas Tendencias en IA para Empresas del Suroccidente',
    excerpt: 'Descubre las últimas tendencias en inteligencia artificial que están transformando las empresas de la región.',
    content: 'Contenido completo del insight...',
    author: 'Equipo CCC',
    publishedAt: '2024-01-20',
    category: 'tendencias',
    featured: true,
  },
  {
    id: '2',
    title: 'Casos de Éxito: Implementación de IA en PyMEs',
    excerpt: 'Conoce casos reales de pequeñas y medianas empresas que han implementado exitosamente herramientas de IA.',
    content: 'Contenido completo del insight...',
    author: 'Equipo CCC',
    publishedAt: '2024-01-18',
    category: 'casos-exito',
    featured: false,
  },
  {
    id: '3',
    title: 'Guía Práctica: Primeros Pasos en IA para Empresarios',
    excerpt: 'Una guía paso a paso para empresarios que quieren comenzar su journey en inteligencia artificial.',
    content: 'Contenido completo del insight...',
    author: 'Equipo CCC',
    publishedAt: '2024-01-15',
    category: 'guias',
    featured: true,
  },
];

export const mockStats = {
  totalLicenses: 1200,
  usedLicenses: 847,
  totalApplications: mockApplications.length,
  approvedApplications: mockApplications.filter(app => app.status === 'aprobado').length,
  completedTests: mockApplications.filter(app => app.testCompleted).length,
  averageProgress: Math.round(
    mockApplications.filter(app => app.progress > 0).reduce((sum, app) => sum + app.progress, 0) /
    mockApplications.filter(app => app.progress > 0).length
  ),
  totalInvestment: mockApplications.reduce((sum, app) => sum + app.aiInvestment2024, 0),
  chamberStats: mockChambers.map(chamber => ({
    name: chamber,
    applications: mockApplications.filter(app => app.chamber === chamber).length,
    approved: mockApplications.filter(app => app.chamber === chamber && app.status === 'aprobado').length,
    completed: mockApplications.filter(app => app.chamber === chamber && app.testCompleted).length,
    averageProgress: Math.round(
      mockApplications
        .filter(app => app.chamber === chamber && app.progress > 0)
        .reduce((sum, app) => sum + app.progress, 0) /
      Math.max(1, mockApplications.filter(app => app.chamber === chamber && app.progress > 0).length)
    ),
  })),
};