document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initNavMenu();
    initAccordion();
    initTestimonialSlider();
    initBenefitsSlider();
    initCountdown();
    initSmoothScroll();
    initFaqAccordion();
    initCookieBanner();
});

// Menú de navegación responsivo
function initNavMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Cerrar el menú al hacer clic en un enlace
    document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
}

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
    let currentSlide = 0;
    let interval;

    // Función para mostrar un slide específico con efecto de fade
    function showSlide(index) {
        // Primero, desvanecemos el slide actual
        if (document.querySelector('.testimonial-slide.active')) {
            document.querySelector('.testimonial-slide.active').classList.add('fade-out');
            
            // Esperamos a que termine la animación de fade-out
            setTimeout(() => {
                // Quitamos todas las clases active y fade-out
                slides.forEach(slide => {
                    slide.classList.remove('active');
                    slide.classList.remove('fade-out');
                    slide.classList.remove('fade-in');
                });
                
                // Activamos el nuevo slide con fade-in
                slides[index].classList.add('active');
                slides[index].classList.add('fade-in');
            }, 500); // 500ms para el fade-out
        } else {
            // Primera carga, simplemente mostramos el primer slide
            slides[index].classList.add('active');
            slides[index].classList.add('fade-in');
        }
    }

    // Función para iniciar la rotación automática
    function startAutoRotation() {
        // Limpiar el intervalo existente si hay uno
        if (interval) {
            clearInterval(interval);
        }
        
        // Crear un nuevo intervalo
        interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 10000); // 10 segundos como solicitado
    }

    // Mostrar el primer slide inicialmente
    showSlide(currentSlide);
    
    // Iniciar la rotación automática
    startAutoRotation();
}

// Slider de beneficios
function initBenefitsSlider() {
    const benefitsSlider = document.querySelector('.benefits-slider');
    const benefitsSlides = document.querySelector('.benefits-slides');
    const cards = document.querySelectorAll('.benefit-card');
    
    if (!benefitsSlider || !benefitsSlides || cards.length === 0) return;
    
    // Determinar cuántas tarjetas mostrar según el ancho de la pantalla
    let cardsToShow = getCardsToShow();
    let currentIndex = 0;
    
    // Actualizar el número de tarjetas a mostrar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', function() {
        cardsToShow = getCardsToShow();
        updateSliderPosition();
    });
    
    function getCardsToShow() {
        const windowWidth = window.innerWidth;
        if (windowWidth < 576) return 1;
        if (windowWidth < 992) return 2;
        return 3;
    }
    
    function updateSliderPosition() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 30; // El valor de gap del CSS
        const offset = currentIndex * (cardWidth + gap);
        benefitsSlides.style.transform = `translateX(-${offset}px)`;
    }
    
    // Función para avanzar al siguiente grupo de tarjetas
    function nextSlide() {
        const totalGroups = Math.ceil(cards.length / cardsToShow);
        currentIndex = (currentIndex + 1) % totalGroups;
        updateSliderPosition();
    }
    
    // Actualizar posición inicial
    updateSliderPosition();
    
    // Rotación automática cada 6 segundos
    setInterval(nextSlide, 6000);
}

// Acordeón para preguntas frecuentes
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Opcional: cerrar otras preguntas
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Abrir/cerrar la pregunta actual
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
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
            floatingCountdown.style.bottom = '70px';
            floatingCountdown.style.top = 'auto';
        } else {
            // En desktop, debe seguir al scroll pero mantener una posición fija
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
            
            if (targetId === '#') return; // No hacer nada si es solo un #
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.main-nav')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Banner de cookies
function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptButton = document.getElementById('accept-cookies');
    const rejectButton = document.getElementById('reject-cookies');
    
    // Verificar si el usuario ya ha aceptado las cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookiesAccepted) {
        // Mostrar el banner si no ha aceptado las cookies
        cookieBanner.classList.add('show');
    }
    
    // Manejar clic en aceptar
    acceptButton.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.remove('show');
    });
    
    // Manejar clic en rechazar
    rejectButton.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'false');
        cookieBanner.classList.remove('show');
    });
} 