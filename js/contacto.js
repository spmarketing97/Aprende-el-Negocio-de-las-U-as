/**
 * Script para manejar el formulario de contacto
 * Aprende el Negocio de las Uñas
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Mostrar estado de carga
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;
            
            // Recopilar los datos del formulario
            const formData = new FormData(contactForm);
            
            // Enviar los datos usando fetch
            fetch('php/form-handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Crear elemento para mostrar el mensaje
                const messageElement = document.createElement('div');
                messageElement.className = data.success ? 'form-success' : 'form-error';
                messageElement.textContent = data.message;
                
                // Mostrar el mensaje
                const formMessages = document.getElementById('form-messages');
                formMessages.innerHTML = '';
                formMessages.appendChild(messageElement);
                
                // Si fue exitoso, limpiar el formulario
                if (data.success) {
                    contactForm.reset();
                    
                    // Registrar evento en Google Analytics si está disponible
                    if (typeof gtag === 'function') {
                        gtag('event', 'form_submission', {
                            'event_category': 'Contact',
                            'event_label': 'Contact Form'
                        });
                    }
                    
                    // Scroll al mensaje
                    formMessages.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Restaurar el botón
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                
                // Mostrar mensaje de error
                const formMessages = document.getElementById('form-messages');
                formMessages.innerHTML = '<div class="form-error">Ha ocurrido un error. Por favor, intenta nuevamente más tarde.</div>';
                
                // Restaurar el botón
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
}); 