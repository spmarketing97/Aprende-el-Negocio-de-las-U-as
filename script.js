document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initAccordion();
    initTestimonialSlider();
    initCountdown();
    initSmoothScroll();
});

// Acordeón para los módulos
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const isActive = accordionItem.classList.contains('active');
            
            // Cerrar todos los acordeones
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Abrir el actual si no estaba abierto
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });

    // Abrir el primer acordeón por defecto
    if (accordionHeaders.length > 0) {
        accordionHeaders[0].parentElement.classList.add('active');
    }
}

// Slider de testimonios
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentSlide = 0;

    // Función para mostrar un slide específico
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    // Mostrar el primer slide inicialmente
    showSlide(currentSlide);

    // Event listeners para los botones de navegación
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
    }

    // Rotación automática cada 7 segundos
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 7000);
}

// Contador regresivo
function initCountdown() {
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const floatingCountdown = document.querySelector('.floating-countdown');
    
    // Verificar si hay un tiempo guardado en localStorage y si no ha expirado
    let countdownExpiry = localStorage.getItem('countdownExpiry');
    const now = new Date().getTime();
    
    // Si no hay tiempo guardado o ya expiró y han pasado más de 5 días
    if (!countdownExpiry || (now > countdownExpiry && now - countdownExpiry > 5 * 24 * 60 * 60 * 1000)) {
        // Establecer una nueva expiración: 30 minutos desde ahora
        countdownExpiry = now + 30 * 60 * 1000;
        localStorage.setItem('countdownExpiry', countdownExpiry);
    }
    
    // Actualizar el contador cada segundo
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = countdownExpiry - now;
        
        if (timeLeft <= 0) {
            // Tiempo expirado
            clearInterval(countdownInterval);
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            return;
        }
        
        // Calcular minutos y segundos
        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Actualizar el DOM
        minutesElement.textContent = minutes < 10 ? '0' + minutes : minutes;
        secondsElement.textContent = seconds < 10 ? '0' + seconds : seconds;
    }
    
    // Ejecutar una vez inmediatamente para evitar retraso visual
    updateCountdown();
    
    // Asegurar que el contador flotante sea visible y siga al usuario
    function updateCountdownPosition() {
        if (window.innerWidth <= 576) {
            // En móviles, fijarlo abajo
            floatingCountdown.style.position = 'fixed';
            floatingCountdown.style.bottom = '0';
            floatingCountdown.style.top = 'auto';
        } else {
            // En desktop, debe seguir al scroll pero mantener una posición fija
            const scrollY = window.scrollY || window.pageYOffset;
            const initialPosition = 100; // Posición inicial desde arriba
            
            floatingCountdown.style.position = 'fixed';
            floatingCountdown.style.top = `${initialPosition}px`;
            floatingCountdown.style.bottom = 'auto';
            
            // Asegurarse que sea visible
            floatingCountdown.style.opacity = '1';
            floatingCountdown.style.visibility = 'visible';
        }
    }
    
    // Actualizar la posición inicial del contador
    updateCountdownPosition();
    
    // Actualizarlo con cada scroll
    window.addEventListener('scroll', updateCountdownPosition);
    
    // Actualizarlo cuando cambie el tamaño de la ventana
    window.addEventListener('resize', updateCountdownPosition);
}

// Smooth scroll para los enlaces internos
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Ajuste para el sticky header
                    behavior: 'smooth'
                });
            }
        });
    });
} 