require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');

// Configuración del cliente de Google Analytics
const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: '../credentials/credentials.json', // Archivo de credenciales de Google
});
const propertyId = process.env.GA_PROPERTY_ID;

// Configuración del transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Obtiene datos de visitantes de los últimos 30 días
 */
async function getVisitorData() {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
        {
          name: 'newUsers',
        },
        {
          name: 'sessions',
        },
        {
          name: 'conversions',
        },
      ],
    });
    
    return response;
  } catch (error) {
    console.error('Error al obtener datos de visitantes:', error);
    throw error;
  }
}

/**
 * Obtiene datos de las fuentes de tráfico
 */
async function getTrafficSourceData() {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          name: 'sessionSource',
        },
      ],
      metrics: [
        {
          name: 'sessions',
        },
        {
          name: 'conversions',
        },
      ],
      orderBys: [
        {
          metric: {
            metricName: 'sessions',
          },
          desc: true,
        },
      ],
      limit: 10,
    });
    
    return response;
  } catch (error) {
    console.error('Error al obtener datos de fuentes de tráfico:', error);
    throw error;
  }
}

/**
 * Formatea los datos para el informe
 */
function formatReportData(visitorData, trafficData) {
  let totalUsers = 0;
  let totalNewUsers = 0;
  let totalSessions = 0;
  let totalConversions = 0;
  
  // Procesar datos de visitantes
  visitorData.rows.forEach(row => {
    const metrics = row.metricValues;
    totalUsers += parseInt(metrics[0].value);
    totalNewUsers += parseInt(metrics[1].value);
    totalSessions += parseInt(metrics[2].value);
    totalConversions += parseInt(metrics[3].value);
  });
  
  // Procesar fuentes de tráfico
  let trafficSources = trafficData.rows.map(row => {
    return {
      source: row.dimensionValues[0].value,
      sessions: row.metricValues[0].value,
      conversions: row.metricValues[1].value
    };
  });
  
  return {
    totalUsers,
    totalNewUsers,
    totalSessions,
    totalConversions,
    trafficSources
  };
}

/**
 * Genera el contenido HTML del informe
 */
function generateReportHtml(data) {
  // Calcular tasa de conversión
  const conversionRate = ((data.totalConversions / data.totalSessions) * 100).toFixed(2);
  
  // Generar tabla de fuentes de tráfico
  let trafficSourcesHtml = '';
  data.trafficSources.forEach(source => {
    trafficSourcesHtml += `
      <tr>
        <td>${source.source}</td>
        <td>${source.sessions}</td>
        <td>${source.conversions}</td>
      </tr>
    `;
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8bbd0; color: #d81b60; padding: 15px; text-align: center; }
        .metrics { display: flex; justify-content: space-between; margin: 20px 0; }
        .metric-card { background-color: #fce4ec; border-radius: 8px; padding: 15px; width: 22%; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #d81b60; }
        .metric-label { font-size: 14px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f8bbd0; color: #d81b60; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Informe de Analytics - Aprende el Negocio de las Uñas</h1>
          <p>Últimos 30 días</p>
        </div>
        
        <div class="metrics">
          <div class="metric-card">
            <div class="metric-value">${data.totalUsers}</div>
            <div class="metric-label">Usuarios Activos</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.totalNewUsers}</div>
            <div class="metric-label">Nuevos Usuarios</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.totalSessions}</div>
            <div class="metric-label">Sesiones</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${conversionRate}%</div>
            <div class="metric-label">Tasa de Conversión</div>
          </div>
        </div>
        
        <h2>Principales Fuentes de Tráfico</h2>
        <table>
          <thead>
            <tr>
              <th>Fuente</th>
              <th>Sesiones</th>
              <th>Conversiones</th>
            </tr>
          </thead>
          <tbody>
            ${trafficSourcesHtml}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Este es un informe automatizado. Por favor no responda a este correo.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envía el informe por email
 */
async function sendReport() {
  try {
    console.log('Generando informe de Analytics...');
    
    // Obtener datos
    const visitorData = await getVisitorData();
    const trafficData = await getTrafficSourceData();
    
    // Formatear datos
    const reportData = formatReportData(visitorData, trafficData);
    
    // Generar HTML
    const htmlContent = generateReportHtml(reportData);
    
    // Enviar email
    const info = await transporter.sendMail({
      from: `"Informes de Analytics" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT,
      subject: 'Informe Semanal de Analytics - Aprende el Negocio de las Uñas',
      html: htmlContent
    });
    
    console.log('Informe enviado: %s', info.messageId);
  } catch (error) {
    console.error('Error al enviar el informe:', error);
  }
}

/**
 * Inicia la programación del informe
 */
function scheduleReport() {
  const scheduleTime = process.env.REPORT_SCHEDULE || '0 9 * * 1'; // Por defecto: lunes a las 9 AM
  
  console.log(`Programando informe para: ${scheduleTime}`);
  
  schedule.scheduleJob(scheduleTime, async () => {
    await sendReport();
  });
  
  console.log('Programación de informes iniciada correctamente.');
}

// Si se ejecuta directamente, enviar un informe ahora
if (require.main === module) {
  if (process.argv[2] === '--now') {
    sendReport().then(() => process.exit(0));
  } else {
    scheduleReport();
  }
}

module.exports = {
  sendReport,
  scheduleReport
}; 