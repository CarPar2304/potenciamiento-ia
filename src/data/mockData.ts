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

export const mockGenders = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];
export const mockEthnicGroups = ['Mestizo', 'Afrodescendiente', 'Indígena', 'Blanco', 'Otro'];
export const mockEducationLevels = ['Bachiller', 'Técnico', 'Tecnológico', 'Profesional', 'Especialización', 'Maestría', 'Doctorado'];
export const mockPositions = ['CEO', 'Gerente General', 'Director', 'Coordinador', 'Jefe', 'Analista', 'Asistente'];
export const mockClientTypes = ['B2B', 'B2C', 'B2G', 'Mixto'];
export const mockMarkets = ['Local', 'Nacional', 'Internacional'];
export const mockIdTypes = ['Cédula de Ciudadanía', 'Cédula de Extranjería', 'Pasaporte', 'Tarjeta de Identidad'];

export const mockAIAreas = [
  'Atención al Cliente',
  'Marketing y Ventas',
  'Recursos Humanos',
  'Finanzas y Contabilidad',
  'Producción y Manufactura',
  'Logística y Supply Chain',
  'Investigación y Desarrollo',
  'Seguridad',
  'Administración'
];

export const mockNotAdoptionReasons = [
  'Falta de presupuesto',
  'Desconocimiento técnico',
  'Resistencia al cambio',
  'Falta de personal capacitado',
  'Consideran que no lo necesitan',
  'Preocupaciones de seguridad',
  'Complejidad de implementación'
];

export const mockPlatziRoutes = [
  'Fundamentos de IA para Negocios',
  'IA Aplicada al Marketing',
  'Automatización con IA',
  'IA para la Gestión Empresarial',
  'Machine Learning para Empresarios',
  'IA Avanzada para Líderes'
];

export const mockCourses = [
  'Introducción a la Inteligencia Artificial',
  'ChatGPT para Empresarios',
  'Automatización de Procesos con IA',
  'Marketing Digital con IA',
  'Análisis de Datos con IA',
  'Desarrollo de Productos con IA',
  'Gestión de Equipos en la Era de la IA',
  'Ética en Inteligencia Artificial',
  'IA para la Toma de Decisiones',
  'Transformación Digital con IA'
];

export const mockApplications = Array.from({ length: 250 }, (_, i) => {
  const hasAI = Math.random() > 0.4;
  const testCompleted = Math.random() > 0.25;
  const platziLevel = testCompleted ? Math.floor(Math.random() * 6) + 1 : null;
  const employees = Math.floor(Math.random() * 500) + 1;
  const femaleEmployees = Math.floor(employees * (0.3 + Math.random() * 0.4));
  const aiInvestment2024 = hasAI ? Math.floor(Math.random() * 200000000) + 10000000 : 0;
  const trainedEmployees = hasAI ? Math.floor(employees * (Math.random() * 0.5)) : 0;
  
  return {
    // IDs y básicos
    id: `app-${i + 1}`,
    firstName: ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Sofía', 'Diego', 'Isabella', 'Andrés', 'Laura', 'Miguel', 'Patricia'][i % 14],
    lastName: ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Torres', 'Vargas'][i % 12],
    email: `usuario${i + 1}@empresa${i + 1}.com`,
    
    // Datos personales expandidos
    gender: mockGenders[i % mockGenders.length],
    ethnicGroup: mockEthnicGroups[i % mockEthnicGroups.length],
    birthDate: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    idType: mockIdTypes[i % mockIdTypes.length],
    document: `${Math.floor(Math.random() * 90000000) + 10000000}`,
    phone: `+57 3${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    educationLevel: mockEducationLevels[Math.floor(Math.random() * mockEducationLevels.length)],
    position: mockPositions[Math.floor(Math.random() * mockPositions.length)],
    
    // Datos empresariales
    chamber: mockChambers[i % mockChambers.length],
    company: `${['Innovación', 'Tecnología', 'Desarrollo', 'Soluciones', 'Servicios', 'Comercializadora', 'Distribuidora', 'Consultora'][Math.floor(Math.random() * 8)]} ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Prime', 'Pro', 'Plus', 'Max'][Math.floor(Math.random() * 8)]} SAS`,
    nit: `9001${String(Math.floor(Math.random() * 900000) + 100000)}-${i % 9 + 1}`,
    sector: mockSectors[i % mockSectors.length],
    products: `Productos y servicios de ${mockSectors[i % mockSectors.length].toLowerCase()}`,
    clientType: mockClientTypes[Math.floor(Math.random() * mockClientTypes.length)],
    market: mockMarkets[Math.floor(Math.random() * mockMarkets.length)],
    employees,
    femaleEmployees,
    sales2024: Math.floor(Math.random() * 10000000000) + 500000000,
    profits2024: Math.floor(Math.random() * 1000000000) + 50000000,
    
    // Datos de adopción de IA
    hasAI,
    aiAreas: hasAI ? mockAIAreas.slice(0, Math.floor(Math.random() * 4) + 1) : [],
    notAdoptionReason: !hasAI ? mockNotAdoptionReasons[Math.floor(Math.random() * mockNotAdoptionReasons.length)] : null,
    aiInvestment2024,
    hasAssignedResources: hasAI ? Math.random() > 0.3 : false,
    aiAdoptionProbability: Math.floor(Math.random() * 5) + 1,
    aiInvestmentProbability: Math.floor(Math.random() * 5) + 1,
    futureAIBudget: Math.floor(Math.random() * 500000000) + 5000000,
    trainedEmployees,
    hasTrainingPlan: trainedEmployees > 0 || Math.random() > 0.6,
    
    // Estado de solicitud
    status: ['pendiente', 'aprobado', 'rechazado', 'en_proceso'][Math.floor(Math.random() * 4)],
    createdAt: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
    
    // Datos de Platzi
    testCompleted,
    platziLevel,
    route: platziLevel ? mockPlatziRoutes[platziLevel - 1] : null,
    progress: testCompleted ? Math.floor(Math.random() * 100) : 0,
    accessStatus: testCompleted ? ['Activo', 'Vencido', 'Suspendido'][Math.floor(Math.random() * 3)] : 'Sin acceso',
    remainingDays: testCompleted && Math.random() > 0.3 ? Math.floor(Math.random() * 365) : 0,
    coursesInProgress: testCompleted ? Math.floor(Math.random() * 5) + 1 : 0,
    coursesCertified: testCompleted ? Math.floor(Math.random() * 3) : 0,
    totalTimeSpent: testCompleted ? Math.floor(Math.random() * 200) + 20 : 0,
    daysWithoutProgress: testCompleted ? Math.floor(Math.random() * 30) : 0,
    activationDate: testCompleted ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : null,
    expirationDate: testCompleted ? new Date(Date.now() + Math.random() * 300 * 24 * 60 * 60 * 1000).toISOString() : null,
  };
});

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