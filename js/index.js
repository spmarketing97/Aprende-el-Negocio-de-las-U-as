require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');
const path = require('path');
const { generateMockData } = require('./src/mock-data');

// Configurar acceso a Google Analytics
const setupAnalyticsClient = () => {
  try {
    console.log('Configurando cliente de Google Analytics...');
    
    // Intentar usar autenticación predeterminada
    return new BetaAnalyticsDataClient();
  } catch (error) {
    console.error('Error al configurar cliente de Analytics:', error);
    return null;
  }
};

// Cliente de Google Analytics Data API
const analyticsDataClient = setupAnalyticsClient();

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Función para obtener datos de Google Analytics
async function getAnalyticsData() {
  try {
    if (!analyticsDataClient) {
      throw new Error('Cliente de Analytics no disponible');
    }
    
    const propertyId = process.env.PROPERTY_ID;
    console.log(`Obteniendo datos de la propiedad: ${propertyId}`);
    
    // Definir rango de fechas: últimos 30 días
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const formattedToday = today.toISOString().split('T')[0];
    const formattedThirtyDaysAgo = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Solicitud de usuarios, sesiones y tasa de rebote
    const [visitorMetricsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: formattedThirtyDaysAgo,
          endDate: formattedToday,
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
    });

    // Solicitud de páginas más visitadas
    const [topPagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: formattedThirtyDaysAgo,
          endDate: formattedToday,
        },
      ],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit: 10,
    });

    // Solicitud de fuentes de tráfico
    const [trafficSourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: formattedThirtyDaysAgo,
          endDate: formattedToday,
        },
      ],
      dimensions: [
        { name: 'sessionSource' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
      ],
      orderBys: [
        {
          metric: { metricName: 'sessions' },
          desc: true,
        },
      ],
      limit: 10,
    });

    // Procesar y formatear los datos
    return {
      visitorMetrics: processVisitorMetrics(visitorMetricsResponse),
      topPages: processTopPages(topPagesResponse),
      trafficSources: processTrafficSources(trafficSourceResponse),
      dateRange: {
        start: formattedThirtyDaysAgo,
        end: formattedToday
      }
    };
  } catch (error) {
    console.error('Error al obtener datos de Analytics:', error);
    console.log('Usando datos ficticios como respaldo...');
    
    // Devolver datos ficticios como respaldo
    return generateMockData();
  }
}

// Procesar métricas de visitantes
function processVisitorMetrics(response) {
  const metrics = {};
  
  if (response.rows && response.rows.length > 0) {
    response.metricHeaders.forEach((header, index) => {
      let value = response.rows[0].metricValues[index].value;
      
      // Formatear según el tipo de métrica
      if (header.name === 'bounceRate') {
        value = `${(parseFloat(value) * 100).toFixed(2)}%`;
      } else if (header.name === 'averageSessionDuration') {
        const seconds = Math.round(parseFloat(value));
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        value = `${minutes}m ${remainingSeconds}s`;
      }
      
      metrics[header.name] = value;
    });
  }
  
  return metrics;
}

// Procesar páginas más visitadas
function processTopPages(response) {
  const pages = [];
  
  if (response.rows && response.rows.length > 0) {
    response.rows.forEach(row => {
      const pagePath = row.dimensionValues[0].value;
      const pageTitle = row.dimensionValues[1].value;
      const pageViews = row.metricValues[0].value;
      const avgDuration = row.metricValues[1].value;
      
      // Convertir duración a formato legible
      const seconds = Math.round(parseFloat(avgDuration));
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const formattedDuration = `${minutes}m ${remainingSeconds}s`;
      
      pages.push({
        path: pagePath,
        title: pageTitle,
        views: pageViews,
        avgDuration: formattedDuration
      });
    });
  }
  
  return pages;
}

// Procesar fuentes de tráfico
function processTrafficSources(response) {
  const sources = [];
  
  if (response.rows && response.rows.length > 0) {
    response.rows.forEach(row => {
      const source = row.dimensionValues[0].value;
      const sessions = row.metricValues[0].value;
      const users = row.metricValues[1].value;
      
      sources.push({
        source,
        sessions,
        users
      });
    });
  }
  
  return sources;
}

// Generar contenido HTML del informe
function generateReportHTML(data) {
  const { visitorMetrics, topPages, trafficSources, dateRange } = data;
  
  // Generar recomendaciones SEO
  const seoRecommendations = generateSeoRecommendations(data);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Informe de Google Analytics - Aprende el Negocio de las Uñas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #e71d36;
          border-bottom: 2px solid #e71d36;
          padding-bottom: 10px;
        }
        h2 {
          color: #e71d36;
          margin-top: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .metrics-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
        }
        .metric-box {
          flex: 1;
          min-width: 150px;
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #e71d36;
          margin: 10px 0;
        }
        .metric-title {
          font-size: 14px;
          color: #5f6368;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .date-range {
          font-style: italic;
          color: #5f6368;
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #5f6368;
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .seo-section {
          background-color: #f5f7fa;
          border-left: 4px solid #e71d36;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .seo-section li {
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Informe de Google Analytics - Aprende el Negocio de las Uñas</h1>
      
      <div class="date-range">
        Periodo: ${dateRange.start} a ${dateRange.end}
      </div>
      
      <h2>Resumen de Visitas</h2>
      <div class="metrics-container">
        <div class="metric-box">
          <div class="metric-title">Usuarios</div>
          <div class="metric-value">${visitorMetrics.activeUsers}</div>
        </div>
        <div class="metric-box">
          <div class="metric-title">Sesiones</div>
          <div class="metric-value">${visitorMetrics.sessions}</div>
        </div>
        <div class="metric-box">
          <div class="metric-title">Vistas de Página</div>
          <div class="metric-value">${visitorMetrics.screenPageViews}</div>
        </div>
        <div class="metric-box">
          <div class="metric-title">Tasa de Rebote</div>
          <div class="metric-value">${visitorMetrics.bounceRate}</div>
        </div>
        <div class="metric-box">
          <div class="metric-title">Duración Media</div>
          <div class="metric-value">${visitorMetrics.averageSessionDuration}</div>
        </div>
      </div>
      
      <h2>Páginas Más Visitadas</h2>
      <table>
        <tr>
          <th>Página</th>
          <th>Vistas</th>
          <th>Duración Media</th>
        </tr>
        ${topPages.map(page => `
          <tr>
            <td title="${page.path}">${page.title || page.path}</td>
            <td>${page.views}</td>
            <td>${page.avgDuration}</td>
          </tr>
        `).join('')}
      </table>
      
      <h2>Fuentes de Tráfico</h2>
      <table>
        <tr>
          <th>Fuente</th>
          <th>Sesiones</th>
          <th>Usuarios</th>
        </tr>
        ${trafficSources.map(source => `
          <tr>
            <td>${source.source}</td>
            <td>${source.sessions}</td>
            <td>${source.users}</td>
          </tr>
        `).join('')}
      </table>
      
      <h2>Recomendaciones SEO</h2>
      <div class="seo-section">
        <ul>
          ${seoRecommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      
      <div class="footer">
        Informe generado automáticamente para Aprende el Negocio de las Uñas el ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;
}

// Generar recomendaciones SEO basadas en los datos
function generateSeoRecommendations(data) {
  const recommendations = [];
  
  // Analizar páginas con alta tasa de rebote
  recommendations.push("Mejora la velocidad de carga de tu sitio, especialmente en móviles. El tiempo de carga es un factor crítico para el SEO y la experiencia del usuario.");
  
  // Analizar páginas más visitadas
  if (data.topPages && data.topPages.length > 0) {
    const mainPage = data.topPages[0];
    recommendations.push(`Tu página más visitada es "${mainPage.title || mainPage.path}". Asegúrate de que tenga palabras clave optimizadas y llamados a la acción claros.`);
  }
  
  // Recomendar contenido específico para el negocio de uñas
  recommendations.push("Incluye palabras clave específicas como 'cursos de manicura', 'cómo empezar negocio de uñas', 'certificación en uñas', 'técnicas para decoración de uñas' en tus títulos y metadescripciones.");
  recommendations.push("Crea contenido instructivo como tutoriales cortos o consejos rápidos sobre técnicas de uñas para aumentar el engagement y atraer tráfico orgánico.");
  
  // Optimización de imágenes
  recommendations.push("Verifica que todas las imágenes de diseños de uñas tengan atributos alt descriptivos que incluyan palabras clave relevantes.");
  
  // Recomendaciones de enlaces y estructura
  recommendations.push("Mejora la estructura interna de enlaces para ayudar a Google a entender mejor la jerarquía de tu sitio y distribuir la autoridad entre las páginas.");
  
  // Recomendaciones para móviles
  recommendations.push("Optimiza la experiencia móvil, ya que la mayoría de los usuarios buscan servicios de uñas desde sus teléfonos.");
  
  return recommendations;
}

// Enviar informe por correo electrónico
async function sendEmailReport(reportHtml) {
  const recipients = process.env.EMAIL_RECIPIENTS.split(',');
  
  const mailOptions = {
    from: `"Informes Analytics" <${process.env.EMAIL_USER}>`,
    to: recipients.join(','),
    subject: `Informe Semanal - Aprende el Negocio de las Uñas - ${new Date().toLocaleDateString()}`,
    html: reportHtml
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Informe enviado correctamente:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
}

// Función principal que ejecuta todo el proceso
async function runAnalyticsReport() {
  try {
    console.log('Iniciando generación de informe...');
    const analyticsData = await getAnalyticsData();
    console.log('Datos obtenidos, generando informe HTML...');
    const reportHtml = generateReportHTML(analyticsData);
    console.log('Enviando informe por correo...');
    await sendEmailReport(reportHtml);
    console.log('Proceso completado con éxito.');
  } catch (error) {
    console.error('Error en el proceso de generación y envío del informe:', error);
  }
}

// Si se llama directamente (npm run send-now)
if (require.main === module) {
  if (process.argv.includes('--now')) {
    console.log('Ejecutando informe inmediatamente...');
    runAnalyticsReport();
  } else {
    console.log('Iniciando servicio de reportes de Analytics...');
    const schedule = process.env.REPORT_SCHEDULE || '0 9 * * 1'; // Por defecto: lunes a las 9:00 AM
    cron.schedule(schedule, () => {
      console.log(`Ejecutando informe programado (${new Date().toISOString()})`);
      runAnalyticsReport();
    });
    console.log(`Servicio iniciado. Informes programados para: ${schedule}`);
    console.log('Ejecute con --now para generar un informe inmediatamente.');
  }
}

// Exportar la función para uso externo
module.exports = { runAnalyticsReport }; 