// Script para configurar informes automáticos de Google Analytics

// Configuración para Google Analytics Data API
require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');

// Ruta al archivo de credenciales
const credentialsPath = path.join(__dirname, '../Credencials/ga-credentials.json');

// Configuración del cliente de Google Analytics
const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: credentialsPath,
});

// ID de la propiedad de Google Analytics
const propertyId = 'G-7QV6ZVLWCJ';

// Configuración del transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'solucionesworld2016@gmail.com',
    pass: 'jgtq ucny jpxc nyoy'
  }
});

// Configuración del destinatario del informe
const reportConfig = {
  to: 'hristiankrasimirov7@gmail.com',
  subject: 'Aprende El Negocio De Las Uñas',
  schedule: '0 9 * * 1' // Todos los lunes a las 9:00 AM
};

// Función para obtener datos de Analytics
async function getAnalyticsData() {
  try {
    // Fecha actual y fecha hace 7 días
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    // Formatear fechas para la API de Analytics
    const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
    const formattedEndDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
    
    // Solicitud para obtener usuarios, sesiones y páginas vistas
    const [visitsResponse] = await analyticsDataClient.runReport({
      property: `properties/${credentials.propertyId}`,
      dateRanges: [
        {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
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
          name: 'sessions',
        },
        {
          name: 'screenPageViews',
        },
      ],
    });
    
    // Solicitud para obtener eventos de clic en el botón de compra
    const [purchaseClicksResponse] = await analyticsDataClient.runReport({
      property: `properties/${credentials.propertyId}`,
      dateRanges: [
        {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      ],
      dimensions: [],
      metrics: [
        {
          name: 'eventCount',
        },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            value: 'Click en botón de compra',
          },
        },
      },
    });
    
    // Solicitud para obtener comportamiento por sección
    const [sectionResponse] = await analyticsDataClient.runReport({
      property: `properties/${credentials.propertyId}`,
      dateRanges: [
        {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      ],
      dimensions: [
        {
          name: 'customEvent:page_section',
        },
      ],
      metrics: [
        {
          name: 'eventCount',
        },
      ],
    });
    
    // Calcular totales
    let totalUsers = 0;
    let totalSessions = 0;
    let totalPageViews = 0;
    
    if (visitsResponse.rows && visitsResponse.rows.length > 0) {
      visitsResponse.rows.forEach(row => {
        totalUsers += parseInt(row.metricValues[0].value);
        totalSessions += parseInt(row.metricValues[1].value);
        totalPageViews += parseInt(row.metricValues[2].value);
      });
    }
    
    // Obtener clics en compra
    let purchaseClicks = 0;
    if (purchaseClicksResponse.rows && purchaseClicksResponse.rows.length > 0) {
      purchaseClicks = parseInt(purchaseClicksResponse.rows[0].metricValues[0].value);
    }
    
    // Obtener datos por sección
    const sectionData = [];
    if (sectionResponse.rows && sectionResponse.rows.length > 0) {
      sectionResponse.rows.forEach(row => {
        sectionData.push({
          section: row.dimensionValues[0].value,
          count: parseInt(row.metricValues[0].value)
        });
      });
    }
    
    // Calcular tasa de conversión (clics de compra / usuarios)
    const conversionRate = totalUsers > 0 ? (purchaseClicks / totalUsers * 100).toFixed(2) : 0;
    
    return {
      date: {
        start: formattedStartDate,
        end: formattedEndDate
      },
      totals: {
        users: totalUsers,
        sessions: totalSessions,
        pageViews: totalPageViews,
        purchaseClicks: purchaseClicks,
        conversionRate: conversionRate
      },
      sectionData: sectionData
    };
  } catch (error) {
    console.error('Error al obtener datos de Analytics:', error);
    return {
      error: error.message,
      date: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      totals: {
        users: 0,
        sessions: 0,
        pageViews: 0,
        purchaseClicks: 0,
        conversionRate: 0
      },
      sectionData: []
    };
  }
}

// Función para generar recomendaciones SEO basadas en los datos
function generateSeoRecommendations(data) {
  const recommendations = [];
  
  // Recomendación basada en tasa de conversión
  if (data.totals.conversionRate < 2) {
    recommendations.push('La tasa de conversión es baja. Considera mejorar la propuesta de valor o los llamados a la acción.');
  }
  
  // Recomendación basada en secciones populares
  if (data.sectionData.length > 0) {
    // Ordenar secciones por popularidad
    const sortedSections = [...data.sectionData].sort((a, b) => b.count - a.count);
    const mostPopular = sortedSections[0];
    const leastPopular = sortedSections[sortedSections.length - 1];
    
    recommendations.push(`La sección "${mostPopular.section}" es la más popular. Aprovecha esto para destacar elementos de conversión.`);
    recommendations.push(`La sección "${leastPopular.section}" tiene menos interacción. Considera mejoras visuales o de contenido.`);
  }
  
  // Recomendaciones generales de SEO
  recommendations.push('Asegúrate de que todas las imágenes tengan atributos alt descriptivos para mejorar SEO y accesibilidad.');
  recommendations.push('Revisa que los tiempos de carga sean óptimos, especialmente en dispositivos móviles.');
  recommendations.push('Considera agregar más palabras clave relacionadas con el negocio de las uñas en títulos y metadescripciones.');
  
  return recommendations;
}

// Función para enviar informe por correo
async function sendAnalyticsReport() {
  try {
    // Obtener datos de Analytics
    const data = await getAnalyticsData();
    
    // Generar recomendaciones
    const recommendations = generateSeoRecommendations(data);
    
    // Crear el contenido HTML del correo
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #e71d36; text-align: center;">Informe Semanal - Aprende el Negocio de las Uñas</h1>
        <p style="text-align: center; color: #666;">Período: ${data.date.start} a ${data.date.end}</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Resumen de Visitas</h2>
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
              <div style="font-size: 24px; font-weight: bold; color: #e71d36;">${data.totals.users}</div>
              <div style="color: #666;">Usuarios</div>
            </div>
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
              <div style="font-size: 24px; font-weight: bold; color: #e71d36;">${data.totals.sessions}</div>
              <div style="color: #666;">Sesiones</div>
            </div>
            <div style="flex-basis: 30%; text-align: center; margin-bottom: 15px;">
              <div style="font-size: 24px; font-weight: bold; color: #e71d36;">${data.totals.pageViews}</div>
              <div style="color: #666;">Vistas de página</div>
            </div>
          </div>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Conversiones</h2>
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="flex-basis: 45%; text-align: center; margin-bottom: 15px;">
              <div style="font-size: 24px; font-weight: bold; color: #e71d36;">${data.totals.purchaseClicks}</div>
              <div style="color: #666;">Clics en botón de compra</div>
            </div>
            <div style="flex-basis: 45%; text-align: center; margin-bottom: 15px;">
              <div style="font-size: 24px; font-weight: bold; color: #e71d36;">${data.totals.conversionRate}%</div>
              <div style="color: #666;">Tasa de conversión</div>
            </div>
          </div>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Recomendaciones SEO</h2>
          <ul style="padding-left: 20px;">
            ${recommendations.map(rec => `<li style="margin-bottom: 10px;">${rec}</li>`).join('')}
          </ul>
        </div>
        
        <p style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          Este es un informe automático. Por favor no responda a este correo.
        </p>
      </div>
    `;
    
    // Configuración del correo
    const mailOptions = {
      from: credentials.email,
      to: credentials.targetEmail,
      subject: 'Aprende el negocio de las uñas - Informe Semanal',
      html: htmlContent
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Informe enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar el informe:', error);
    return false;
  }
}

// Programar el informe para los lunes a las 9:00 AM
schedule.scheduleJob('0 9 * * 1', sendAnalyticsReport);

console.log('Servicio de informes analíticos iniciado. Los informes se enviarán los lunes a las 9:00 AM.');

// Exportar funciones para uso externo si es necesario
module.exports = {
  getAnalyticsData,
  sendAnalyticsReport
};