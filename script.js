// Inicialización de AOS (Animaciones al hacer scroll)
AOS.init({
    duration: 800,
    easing: 'ease',
    once: true,
    offset: 100
});

// Contador regresivo y manejo de cookies
document.addEventListener('DOMContentLoaded', function() {
    // Inicialización del slider de testimonios después de que todo se cargue
    setTimeout(function() {
        initializeTestimonialSlider();
    }, 500);

    // Función para inicializar el slider de testimonios
    function initializeTestimonialSlider() {
        console.log('Inicializando slider de testimonios...');
        const testimonialSlider = document.querySelector('.testimonial-slider');
        const testimonialSlides = document.querySelectorAll('.testimonial-slide');
        const prevButton = document.querySelector('.prev-button');
        const nextButton = document.querySelector('.next-button');
        
        if (testimonialSlider && testimonialSlides.length > 0) {
            let currentSlide = 0;
            let testimonialInterval;
            
            // Asegurarse de que todos los slides sean visibles pero inactivos al inicio
            testimonialSlides.forEach((slide, index) => {
                slide.style.position = 'absolute';
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
                slide.classList.remove('active');
            });
            
            // Activar el primer slide
            if (testimonialSlides.length > 0) {
                testimonialSlides[0].classList.add('active');
                testimonialSlides[0].style.opacity = '1';
                testimonialSlides[0].style.visibility = 'visible';
            }
            
            // Función para mostrar un slide específico
            function showSlide(index) {
                // Limita el índice al rango de slides disponibles
                if (index < 0) index = testimonialSlides.length - 1;
                if (index >= testimonialSlides.length) index = 0;
                
                // Quita la clase active de todos los slides
                testimonialSlides.forEach(slide => {
                    slide.classList.remove('active');
                    slide.style.opacity = '0';
                    slide.style.visibility = 'hidden';
                });
                
                // Añade la clase active al slide actual
                testimonialSlides[index].classList.add('active');
                testimonialSlides[index].style.opacity = '1';
                testimonialSlides[index].style.visibility = 'visible';
                currentSlide = index;
            }
            
            // Función para ir al siguiente slide
            function nextSlide() {
                showSlide(currentSlide + 1);
            }
            
            // Función para ir al slide anterior
            function prevSlide() {
                showSlide(currentSlide - 1);
            }
            
            // Configurar los botones de navegación
            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    nextSlide();
                    // Reinicia el intervalo cuando se hace clic manualmente
                    clearInterval(testimonialInterval);
                    testimonialInterval = setInterval(nextSlide, 10000);
                });
            }
            
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    prevSlide();
                    // Reinicia el intervalo cuando se hace clic manualmente
                    clearInterval(testimonialInterval);
                    testimonialInterval = setInterval(nextSlide, 10000);
                });
            }
            
            // Inicia la rotación automática
            testimonialInterval = setInterval(nextSlide, 10000);
        }
    }
    
    // Configuración del contador: 25 minutos en segundos
    const COUNTDOWN_DURATION = 25 * 60;
    
    // Referencias a elementos del DOM
    const headerMinutes = document.getElementById('header-minutes');
    const headerSeconds = document.getElementById('header-seconds');
    const footerMinutes = document.getElementById('footer-minutes');
    const footerSeconds = document.getElementById('footer-seconds');
    const headerCountdown = document.getElementById('header-countdown');
    const footerCountdown = document.getElementById('footer-countdown');
    const currentYearSpan = document.getElementById('current-year');
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    // Funcionalidad de menú toggle para móviles
    if (navbarToggle && navbarLinks) {
        navbarToggle.addEventListener('click', function() {
            navbarLinks.classList.toggle('active');
            const isOpen = navbarLinks.classList.contains('active');
            navbarToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Cerrar menú cuando se hace clic en cualquier enlace
        const navLinks = navbarLinks.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Solo cerrar si el menú está abierto (clase active presente)
                if (navbarLinks.classList.contains('active')) {
                    navbarLinks.classList.remove('active');
                    navbarToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }
    
    // Cambio de estilo del navbar al hacer scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Variables para el contador
    let countdownTime;
    let countdownInterval;
    
    // Función para establecer el año actual en el footer
    function setCurrentYear() {
        const now = new Date();
        currentYearSpan.textContent = now.getFullYear();
    }
    
    // Actualizar el año actual
    setCurrentYear();
    
    // Función para guardar el tiempo restante en cookies
    function saveCountdownTime(time) {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 días
        document.cookie = `countdownTime=${time};expires=${expiryDate.toUTCString()};path=/`;
    }
    
    // Función para leer el tiempo restante de las cookies
    function getCountdownTime() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('countdownTime=')) {
                return parseInt(cookie.substring('countdownTime='.length), 10);
            }
        }
        return null;
    }
    
    // Función para formatear el tiempo (añadir ceros a la izquierda)
    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }
    
    // Función para actualizar la visualización del contador
    function updateCountdownDisplay() {
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;
        
        // Actualiza ambos contadores (cabecera y footer)
        headerMinutes.textContent = formatTime(minutes);
        headerSeconds.textContent = formatTime(seconds);
        footerMinutes.textContent = formatTime(minutes);
        footerSeconds.textContent = formatTime(seconds);
        
        // Añade clase de urgencia cuando queden menos de 5 minutos
        if (countdownTime <= 300) {
            headerCountdown.classList.add('urgent');
            footerCountdown.classList.add('urgent');
        } else {
            headerCountdown.classList.remove('urgent');
            footerCountdown.classList.remove('urgent');
        }
    }
    
    // Función para iniciar el contador
    function startCountdown() {
        // Comprueba si hay un contador guardado en cookies
        const savedTime = getCountdownTime();
        
        // Si hay tiempo guardado y es válido, lo usamos; de lo contrario, comenzamos desde el principio
        if (savedTime && savedTime > 0 && savedTime <= COUNTDOWN_DURATION) {
            countdownTime = savedTime;
        } else {
            countdownTime = COUNTDOWN_DURATION;
        }
        
        // Actualiza la visualización inicial
        updateCountdownDisplay();
        
        // Inicia el intervalo para el conteo regresivo
        countdownInterval = setInterval(function() {
            countdownTime--;
            
            if (countdownTime <= 0) {
                // Cuando llega a cero, reinicia el contador
                countdownTime = COUNTDOWN_DURATION;
                
                // Elimina la clase de urgencia
                headerCountdown.classList.remove('urgent');
                footerCountdown.classList.remove('urgent');
            }
            
            // Actualiza la visualización y guarda en cookies
            updateCountdownDisplay();
            saveCountdownTime(countdownTime);
        }, 1000);
    }
    
    // Acción de scroll para el contador de la cabecera
    window.addEventListener('scroll', function() {
        const countdownSticky = document.querySelector('.countdown-sticky');
        const scrollPosition = window.scrollY;
        
        // Cuando el usuario hace scroll, ajustamos la opacidad del contador
        if (scrollPosition > 200) {
            countdownSticky.style.opacity = '0.9';
        } else {
            countdownSticky.style.opacity = '1';
        }
    });
    
    // Inicia el contador
    startCountdown();
    
    // La implementación del acordeón se ha movido a js/accordion.js
    // para mejorar la organización del código y evitar conflictos

    
    // Animación para números en contador de precio
    const animateCountUp = () => {
        const countElements = document.querySelectorAll('.count-up');
        
        countElements.forEach(element => {
            const target = parseInt(element.getAttribute('data-target'));
            const count = parseInt(element.innerText);
            const speed = 50; // Velocidad de la animación
            
            if (count < target) {
                element.innerText = Math.ceil(count + target / speed);
                setTimeout(() => animateCountUp(), 1);
            } else {
                element.innerText = target;
            }
        });
    };
    
    // Navegación suave para enlaces de anclaje
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Manejo de la sección de preguntas frecuentes (FAQ)
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        // Eliminar cualquier event listener previo
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                const newQuestion = question.cloneNode(true);
                question.parentNode.replaceChild(newQuestion, question);
            }
        });
        
        // Añadir nuevos event listeners
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            if (question) {
                question.addEventListener('click', function() {
                    // Comprobar si el elemento actual está activo
                    const isActive = item.classList.contains('active');
                    
                    // Cerrar todas las preguntas abiertas
                    faqItems.forEach(faqItem => {
                        faqItem.classList.remove('active');
                        const q = faqItem.querySelector('.faq-question');
                        if (q) q.setAttribute('aria-expanded', 'false');
                    });
                    
                    // Si el elemento no estaba activo, abrirlo
                    if (!isActive) {
                        item.classList.add('active');
                        question.setAttribute('aria-expanded', 'true');
                    }
                });
                
                // Configuración inicial de ARIA
                question.setAttribute('aria-expanded', item.classList.contains('active'));
            }
        });
        
        // Activar la primera pregunta por defecto
        if (faqItems.length > 0) {
            faqItems[0].classList.add('active');
            const firstQuestion = faqItems[0].querySelector('.faq-question');
            if (firstQuestion) firstQuestion.setAttribute('aria-expanded', 'true');
        }
    }
    
    // Efecto paralaje para el banner
    const banner = document.querySelector('.banner-img');
    if (banner) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            banner.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        });
    }
    
    // Animación de aparición para elementos cuando se hacen visibles
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('visible');
            }
        });
    };
    
    // Iniciar la primera animación de elementos y luego en scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // Efecto de brillo para botones principales
    const primaryButtons = document.querySelectorAll('.btn-primary');
    
    primaryButtons.forEach(button => {
        button.addEventListener('mouseover', function() {
            this.classList.add('shine');
        });
        
        button.addEventListener('mouseout', function() {
            this.classList.remove('shine');
        });
    });
    
    // Efecto de pulsación para CTA principal
    const pulsateButtons = document.querySelectorAll('.btn-lg.btn-primary');
    
    pulsateButtons.forEach(button => {
        setInterval(() => {
            button.classList.add('pulsate');
            
            setTimeout(() => {
                button.classList.remove('pulsate');
            }, 1000);
        }, 3000);
    });

    // Flecha volver arriba
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });
    
    backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        const header = document.querySelector('.header');
        header.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
    
    // Funcionalidad para los popups de compras recientes
    // Datos de los 50 popups de compras recientes
    const purchaseData = [
        { name: "María", location: "Madrid", time: "Hace 5 minutos", rating: 5 },
        { name: "Laura", location: "Barcelona", time: "Hace 8 minutos", rating: 5 },
        { name: "Sofía", location: "Valencia", time: "Hace 12 minutos", rating: 5 },
        { name: "Ana", location: "Sevilla", time: "Hace 15 minutos", rating: 5 },
        { name: "Carmen", location: "Bilbao", time: "Hace 18 minutos", rating: 5 },
        { name: "Lucía", location: "Zaragoza", time: "Hace 20 minutos", rating: 5 },
        { name: "Elena", location: "Málaga", time: "Hace 25 minutos", rating: 5 },
        { name: "Patricia", location: "Alicante", time: "Hace 27 minutos", rating: 5 },
        { name: "Sara", location: "Córdoba", time: "Hace 30 minutos", rating: 5 },
        { name: "Isabel", location: "Granada", time: "Hace 32 minutos", rating: 5 },
        { name: "Paula", location: "Toledo", time: "Hace 35 minutos", rating: 5 },
        { name: "Cristina", location: "Murcia", time: "Hace 38 minutos", rating: 5 },
        { name: "Beatriz", location: "Salamanca", time: "Hace 40 minutos", rating: 5 },
        { name: "Natalia", location: "Santander", time: "Hace 45 minutos", rating: 5 },
        { name: "Adriana", location: "Cádiz", time: "Hace 48 minutos", rating: 5 },
        { name: "Marina", location: "Huelva", time: "Hace 50 minutos", rating: 5 },
        { name: "Silvia", location: "Jaén", time: "Hace 55 minutos", rating: 5 },
        { name: "Alba", location: "Almería", time: "Hace 1 hora", rating: 5 },
        { name: "Angela", location: "Ciudad Real", time: "Hace 1 hora", rating: 5 },
        { name: "Julia", location: "Castellón", time: "Hace 1 hora", rating: 5 },
        { name: "Claudia", location: "La Coruña", time: "Hace 1 hora", rating: 5 },
        { name: "Marta", location: "León", time: "Hace 1 hora", rating: 4 },
        { name: "Rosa", location: "Ávila", time: "Hace 1 hora", rating: 5 },
        { name: "Carolina", location: "Cáceres", time: "Hace 2 horas", rating: 5 },
        { name: "Daniela", location: "Badajoz", time: "Hace 2 horas", rating: 5 },
        { name: "Pilar", location: "Pamplona", time: "Hace 2 horas", rating: 5 },
        { name: "Susana", location: "Logroño", time: "Hace 2 horas", rating: 5 },
        { name: "Raquel", location: "Segovia", time: "Hace 2 horas", rating: 5 },
        { name: "Andrea", location: "Burgos", time: "Hace 3 horas", rating: 5 },
        { name: "Teresa", location: "Albacete", time: "Hace 3 horas", rating: 5 },
        { name: "Miriam", location: "Tarragona", time: "Hace 3 horas", rating: 5 },
        { name: "Nuria", location: "Girona", time: "Hace 3 horas", rating: 4 },
        { name: "Eva", location: "Lleida", time: "Hace 3 horas", rating: 5 },
        { name: "Sonia", location: "Ourense", time: "Hace 4 horas", rating: 5 },
        { name: "Montserrat", location: "Lugo", time: "Hace 4 horas", rating: 5 },
        { name: "Inés", location: "Pontevedra", time: "Hace 4 horas", rating: 5 },
        { name: "Victoria", location: "Valladolid", time: "Hace 4 horas", rating: 5 },
        { name: "Amparo", location: "Zamora", time: "Hace 5 horas", rating: 5 },
        { name: "Irene", location: "Palencia", time: "Hace 5 horas", rating: 5 },
        { name: "Lourdes", location: "Soria", time: "Hace 5 horas", rating: 5 },
        { name: "Vanesa", location: "Teruel", time: "Hace 5 horas", rating: 5 },
        { name: "Clara", location: "Huesca", time: "Hace 6 horas", rating: 5 },
        { name: "Yolanda", location: "Cuenca", time: "Hace 6 horas", rating: 4 },
        { name: "Lorena", location: "Guadalajara", time: "Hace 6 horas", rating: 5 },
        { name: "Alejandra", location: "Tarragona", time: "Hace 6 horas", rating: 5 },
        { name: "Noelia", location: "Alicante", time: "Hace 7 horas", rating: 5 },
        { name: "Esther", location: "Álava", time: "Hace 7 horas", rating: 5 },
        { name: "Verónica", location: "Guipúzcoa", time: "Hace 7 horas", rating: 5 },
        { name: "Diana", location: "Vizcaya", time: "Hace 7 horas", rating: 5 },
        { name: "Mónica", location: "Madrid", time: "Hace 8 horas", rating: 5 }
    ];

    const popupsContainer = document.getElementById('purchase-popups');
    let currentPopupIndex = 0;
    let currentPopupElement = null;

    // Función para crear una calificación por estrellas
    function createStarRating(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars += '★';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    // Función para crear un popup de compra
    function createPurchasePopup(purchaseData) {
        const popup = document.createElement('div');
        popup.className = 'purchase-popup';
        
        // Aplicar estilos directamente para forzar la posición y visibilidad
        popup.style.position = 'fixed';
        popup.style.bottom = '20px';
        popup.style.left = '20px';
        popup.style.zIndex = '9999';
        popup.style.backgroundColor = 'white';
        popup.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        popup.style.borderRadius = '8px';
        popup.style.padding = '15px';
        popup.style.maxWidth = '280px';
        popup.style.display = 'flex';
        popup.style.flexDirection = 'column';
        popup.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(20px)';
        
        const content = `
            <div class="purchase-popup-content">
                <div class="purchase-popup-text">
                    <p><strong>${purchaseData.name}</strong> de ${purchaseData.location} ha comprado el curso</p>
                    <div class="purchase-popup-rating" style="color: #ffcc00; font-size: 0.9rem; margin-top: 5px;">${createStarRating(purchaseData.rating)}</div>
                    <div class="purchase-popup-time" style="font-size: 0.75rem; color: #777; margin-top: 5px;">${purchaseData.time}</div>
                </div>
            </div>
        `;
        
        popup.innerHTML = content;
        
        return popup;
    }

    // Función para mostrar un popup
    function showPopup() {
        // Si hay un popup actualmente visible, lo ocultamos
        if (currentPopupElement) {
            currentPopupElement.style.opacity = '0';
            currentPopupElement.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                if (currentPopupElement && currentPopupElement.parentNode) {
                    currentPopupElement.parentNode.removeChild(currentPopupElement);
                }
                currentPopupElement = null;
                
                // Mostrar el siguiente popup después de un pequeño retraso
                setTimeout(showNextPopup, 500);
            }, 500);
        } else {
            showNextPopup();
        }
    }

    // Función para mostrar el siguiente popup
    function showNextPopup() {
        const purchase = purchaseData[currentPopupIndex];
        const popup = createPurchasePopup(purchase);
        
        document.body.appendChild(popup);
        currentPopupElement = popup;
        
        // Mostramos el popup con una animación
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0)';
        }, 100);
        
        // Incrementamos el índice para el próximo popup
        currentPopupIndex = (currentPopupIndex + 1) % purchaseData.length;
        
        // Programamos la ocultación del popup después de 5 segundos
        setTimeout(() => {
            if (popup && popup.parentNode) {
                popup.style.opacity = '0';
                popup.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    if (popup && popup.parentNode) {
                        popup.parentNode.removeChild(popup);
                    }
                    currentPopupElement = null;
                }, 500);
            }
        }, 5000);
        
        // Programamos la aparición del siguiente popup después de 10 segundos
        setTimeout(showPopup, 10000);
    }

    // Comenzamos a mostrar popups después de que la página se haya cargado completamente
    setTimeout(showPopup, 3000);
});