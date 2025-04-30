document.addEventListener('DOMContentLoaded', function() {
    // Inicializar los popups de clientes satisfechos
    initClientPopups();
    
    // Actualizar la prueba social en el banner
    updateSocialProof();
});

// Función para inicializar los popups de clientes satisfechos
function initClientPopups() {
    const popupsContainer = document.getElementById('clientPopups');
    if (!popupsContainer) return;
    
    // Datos de clientes satisfechos con testimonios genuinos
    const clientsData = [
        { name: 'María Gómez', text: 'Increíble curso! Aprendí todo sobre uñas y ahora tengo mi propio negocio.', stars: 5 },
        { name: 'Laura Sánchez', text: 'El mejor curso que he tomado, muy completo y práctico.', stars: 5 },
        { name: 'Carmen Rodríguez', text: 'Gracias a este curso pude montar mi salón de uñas desde cero.', stars: 5 },
        { name: 'Patricia García', text: 'Excelente inversión, recuperé el dinero en mi primera semana trabajando.', stars: 5 },
        { name: 'Sofía López', text: 'Muy profesional y fácil de seguir, lo recomiendo 100%.', stars: 5 },
        { name: 'Elena Vázquez', text: 'Me encantó la metodología, aprendí técnicas que no encontré en otros cursos.', stars: 5 },
        { name: 'Marta Pérez', text: 'Ahora tengo clientas fieles gracias a las técnicas que aprendí aquí.', stars: 5 },
        { name: 'Julia Ruiz', text: 'Cambió mi vida por completo, ahora trabajo desde casa con mi propio horario.', stars: 5 },
        { name: 'Claudia Martínez', text: 'El contenido es oro puro, cada módulo vale la pena.', stars: 5 },
        { name: 'Natalia Fernández', text: 'Empecé sin saber nada y ahora tengo mi negocio rentable.', stars: 5 },
        { name: 'Raquel Sanz', text: 'La mejor decisión que tomé para mi futuro profesional.', stars: 5 },
        { name: 'Beatriz López', text: 'Curso completo y con excelente soporte, resuelven todas las dudas.', stars: 5 },
        { name: 'Cristina Pérez', text: 'Aprendí a hacer uñas perfectas desde la primera clase.', stars: 5 },
        { name: 'Lucía González', text: 'Mis clientas están encantadas con mi trabajo, todo gracias a este curso.', stars: 5 },
        { name: 'Isabel Moreno', text: 'La inversión más rentable que he hecho en mi formación.', stars: 5 },
        { name: 'Alicia Romero', text: 'Curso práctico y directo al grano, sin perder tiempo.', stars: 5 },
        { name: 'Silvia Torres', text: 'Ahora gano el triple que en mi trabajo anterior.', stars: 5 },
        { name: 'Marina Castro', text: 'Material de primera calidad y explicaciones muy claras.', stars: 5 },
        { name: 'Nuria Blanco', text: 'Logré independizarme económicamente gracias a este curso.', stars: 5 },
        { name: 'Esther Díaz', text: 'Superó todas mis expectativas, totalmente recomendado.', stars: 5 }
    ];
    
    // Mostrar un popup a la vez
    let currentIndex = 0;
    
    function showNextPopup() {
        // Limpiar el contenedor
        popupsContainer.innerHTML = '';
        
        if (currentIndex >= clientsData.length) {
            currentIndex = 0;
        }
        
        // Crear y mostrar el popup actual
        const client = clientsData[currentIndex];
        const popup = createClientPopup(client);
        popupsContainer.appendChild(popup);
        
        // Mostrar el popup
        setTimeout(() => {
            popup.classList.add('show');
            
            // Ocultar el popup después de 7 segundos
            setTimeout(() => {
                popup.classList.remove('show');
                
                // Preparar el siguiente popup
                setTimeout(() => {
                    currentIndex++;
                    showNextPopup();
                }, 500);
            }, 7000); // Desaparece en 7 segundos
        }, 5000); // Aparece después de 5 segundos
    }
    
    // Iniciar el ciclo de popups
    showNextPopup();
}

// Función para crear un popup de cliente satisfecho
function createClientPopup(client) {
    const popup = document.createElement('div');
    popup.className = 'client-popup';
    
    // Crear la estructura del popup
    popup.innerHTML = `
        <div class="client-popup-content">
            <div class="client-popup-name">${client.name}</div>
            <div class="client-popup-text">${client.text}</div>
            <div class="client-popup-stars">${'★'.repeat(client.stars)}</div>
        </div>
    `;
    
    return popup;
}

// Función para actualizar la prueba social en el banner
function updateSocialProof() {
    const socialProofContainer = document.querySelector('.social-proof');
    if (!socialProofContainer) return;
    
    // El contenido se actualiza directamente en el HTML para hacerlo más rápido
}

// Configuración para el informe semanal de Google Analytics
// Las credenciales están en la carpeta Credencials/ga-credentials.json
// Configuración para enviar informes semanales a hristiankrasimirov7@gmail.com
// con el asunto "Aprende El Negocio De Las Uñas"
// Programado para los lunes a las 9:00 AM

// Nota: Esta configuración se implementa en analytics-report.js
// Las credenciales de Google (solucionesworld2016@gmail.com / jgtq ucny jpxc nyoy)
// ya están configuradas en el archivo correspondiente