export const es = {
  common: {
    title: 'Plataforma de Entradas y Control de Aforo',
    welcome: 'Bienvenido al Sistema Seguro de Eventos',
    loginGoogle: 'Iniciar sesión con Google (SSO)',
    logout: 'Cerrar Sesión',
    loading: 'Cargando...'
  },
  events: {
    catalog: 'Catálogo de Eventos',
    buyTicket: 'Comprar Entrada',
    resellTicket: 'Reventa Segura',
    myTickets: 'Mis Entradas',
    capacity: 'Aforo Actual',
    available: 'Disponibles'
  },
  security: {
    secureTransfer: 'Transferencia Criptográfica Antifraude',
    qrDynamicNotice: 'El código QR rota cada 30 segundos para evitar duplicaciones.'
  }
};

export const en = {
  common: {
    title: 'Event Ticketing & Real-time Crowd Management',
    welcome: 'Welcome to the Secure Event System',
    loginGoogle: 'Sign in with Google (SSO)',
    logout: 'Sign Out',
    loading: 'Loading...'
  },
  events: {
    catalog: 'Event Catalog',
    buyTicket: 'Buy Ticket',
    resellTicket: 'Secure Resell',
    myTickets: 'My Tickets',
    capacity: 'Current Capacity',
    available: 'Available'
  },
  security: {
    secureTransfer: 'Cryptographic Anti-Fraud Transfer',
    qrDynamicNotice: 'QR code dynamically refreshes every 30 seconds to prevent duplication.'
  }
};

export type Locale = 'es' | 'en';
export type TranslationDict = typeof es;
