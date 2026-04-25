// Mock inbox para Invoice Chaser
// Hoy = 2026-04-25. Las fechas están calculadas relativas a esa referencia.
// 5 archetypes de cliente moroso, uno por entrada.

export type MockEmail = {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  date: string;
  body: string;
  invoiceAmount: number;
  invoiceNumber: string;
  invoiceDate: string;
  daysOverdue: number;
  service: string;
};

export const mockEmails: MockEmail[] = [
  // 1 — El que ignora: silencio total desde que se mandó la factura
  {
    id: '1',
    from: 'laura.guerrero@dentalpolanco.com.mx',
    fromName: 'Laura Guerrero',
    subject: 'Factura A-2098 — Identidad de marca clínica dental',
    date: '2026-03-20',
    body: 'Hola, te comparto los datos fiscales para la factura: Dental Polanco SA de CV, RFC DPO180412AB3. Quedamos atentos a que la generes para procesar el pago. Saludos.',
    invoiceAmount: 24500,
    invoiceNumber: 'A-2098',
    invoiceDate: '2026-03-20',
    daysOverdue: 36,
    service: 'Identidad de marca y manual',
  },

  // 2 — El que da largas: el clásico "te aviso cuando pague el contador"
  {
    id: '2',
    from: 'carlos.mendez@restaurantelapatrona.mx',
    fromName: 'Carlos Méndez',
    subject: 'Re: Factura A-2103 — Sitio web restaurante',
    date: '2026-04-10',
    body: 'Hola, ya recibí la factura. Te aviso cuando la pague el contador, anda con muchas cosas estos días. Cualquier cosa te marco.',
    invoiceAmount: 18500,
    invoiceNumber: 'A-2103',
    invoiceDate: '2026-03-01',
    daysOverdue: 55,
    service: 'Sitio web institucional',
  },

  // 3 — El que alega bug: usa una falla técnica como excusa para no pagar
  {
    id: '3',
    from: 'mfernanda@boutiqueamaranto.com',
    fromName: 'María Fernanda Rivas',
    subject: 'Re: Factura A-2110 — Tienda en línea',
    date: '2026-04-15',
    body: 'Oye, el sitio se cae a veces cuando los clientes intentan pagar y nos están reclamando. Lo reviso bien con mi equipo y en cuanto confirmemos que ya quedó te hago el pago. Necesito estar segura antes de liberar el monto.',
    invoiceAmount: 32800,
    invoiceNumber: 'A-2110',
    invoiceDate: '2026-03-15',
    daysOverdue: 41,
    service: 'Ecommerce Shopify + integración pagos',
  },

  // 4 — El que prometió y no cumplió: dijo "pago el viernes" hace 3 semanas
  {
    id: '4',
    from: 'jramirez@despachoramirezasoc.mx',
    fromName: 'Javier Ramírez',
    subject: 'Re: Factura A-2089 — Copy y SEO sitio despacho',
    date: '2026-04-03',
    body: 'Todo bien, este viernes te hago la transferencia sin falta. Disculpa la demora, la quincena pasada se nos juntó todo. Te confirmo en cuanto salga el movimiento.',
    invoiceAmount: 14200,
    invoiceNumber: 'A-2089',
    invoiceDate: '2026-02-20',
    daysOverdue: 64,
    service: 'Copy legal y SEO on-page',
  },

  // 5 — El cliente terminal: silencio total, 90+ días, candidato a pause de servicio
  {
    id: '5',
    from: 'director@gymferozfitness.com',
    fromName: 'Ricardo Sandoval',
    subject: 'Factura A-2061 — App móvil miembros gimnasio',
    date: '2026-01-18',
    body: 'Te paso copia de la factura por la entrega final de la app. Cualquier duda con los datos fiscales o el desglose, me avisas. Quedo pendiente.',
    invoiceAmount: 58000,
    invoiceNumber: 'A-2061',
    invoiceDate: '2026-01-18',
    daysOverdue: 97,
    service: 'App móvil iOS + Android (React Native)',
  },
];
