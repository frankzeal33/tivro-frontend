document.addEventListener('DOMContentLoaded', function () {
    // Initialize all features in one event handler

    // 1. Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: false,
            offset: 60,
            anchorPlacement: 'top-bottom',
        });
    }

    // 2. Hero section scale effect homepage
    function setupHeroScale() {
        const hero = document.querySelector('.hero');
        const content = hero ? hero.querySelector('.hero-content') : null;

        if (hero && content) {
            function updateHeroScale() {
                const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                const initialHeight = window.innerHeight;
                const minScale = 0.5;

                if (scrollPosition < initialHeight) {
                    const scale = 1 - (scrollPosition / initialHeight) * (1 - minScale);
                    content.style.transform = 'scale(' + scale + ')';
                    content.style.transformOrigin = 'center bottom';
                } else {
                    content.style.transform = 'scale(' + minScale + ')';
                }
            }

            // Initial setup
            updateHeroScale();
            // Add scroll listener
            window.addEventListener('scroll', updateHeroScale);
        }
    }

    // 3. Hero content translation effect
    function setupHeroTranslation() {
        const hero = document.querySelector('.hero-others');
        const heroContent = hero ? hero.querySelector('.hero-content-others') : null;

        if (hero && heroContent) {
            function updateHeroTranslation() {
                const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                const maxScroll = window.innerHeight;

                if (scrollPosition < maxScroll) {
                    const translateY = Math.min(scrollPosition / 2, maxScroll / 2);
                    heroContent.style.transform = `translateY(-${translateY}px)`;
                    heroContent.classList.remove('translate');
                } else {
                    heroContent.style.transform = `translateY(-${maxScroll / 2}px)`;
                    heroContent.classList.add('translate');
                }
            }

            // Initial setup
            updateHeroTranslation();

            // Debounced scroll handler
            let isScrolling = false;
            window.addEventListener('scroll', function () {
                if (!isScrolling) {
                    window.requestAnimationFrame(function () {
                        updateHeroTranslation();
                        isScrolling = false;
                    });
                    isScrolling = true;
                }
            });
        }
    }

    // 4. Counter animation with Intersection Observer
    function setupCounters() {
        const counters = document.querySelectorAll('.stat-item h2');

        if (counters.length > 0) {
            // Create one observer for all counters
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => {
                observer.observe(counter);
            });

            function startCounter(counter) {
                const target = +counter.getAttribute('data-target');
                let currentNumber = 0;

                const baseDuration = 20000;
                const maxDuration = 80000;
                const duration = Math.min(maxDuration, baseDuration + target * 5);
                let increment = Math.max(0.05, target / (duration / 100));

                function formatNumber(number) {
                    let formattedNumber = new Intl.NumberFormat().format(Math.floor(number));
                    return number >= 1000 ? `+${formattedNumber}` : formattedNumber;
                }

                function animateCounter() {
                    currentNumber += increment;

                    if (currentNumber >= target) {
                        currentNumber = target;
                    }

                    counter.textContent = formatNumber(currentNumber);

                    if (currentNumber < target) {
                        setTimeout(() => {
                            requestAnimationFrame(animateCounter);
                        }, 100);
                    }
                }

                animateCounter();
            }
        }
    }

    // 5. Accordion functionality
    function setupAccordion() {
        const accordionItems = document.querySelectorAll('.accordion-item');

        accordionItems.forEach((item, index) => {
            const collapseElement = item.querySelector('.accordion-collapse');

            if (!collapseElement) return;

            // Set first item as active if it has 'show' class
            if (index === 0 && collapseElement.classList.contains('show')) {
                item.classList.add('active');
            }

            collapseElement.addEventListener('show.bs.collapse', () => {
                item.classList.add('active');
            });

            collapseElement.addEventListener('hide.bs.collapse', () => {
                item.classList.remove('active');
            });
        });
    }

    // 6. Navbar scroll effect
    function setupNavbar() {
        const navbar = document.querySelector('.navbar');

        if (navbar) {
            function updateNavbar() {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            // Initial check
            updateNavbar();
            // Add scroll listener
            window.addEventListener('scroll', updateNavbar);
        }
    }

    function addAccordionSvgIcons() {
        // Select all accordion buttons
        const accordionButtons = document.querySelectorAll('.accordion-button');

        accordionButtons.forEach(button => {
            // Create img element for SVG
            const svgIcon = document.createElement('img');
            svgIcon.src = 'images/icons/arrow-down-circle.svg'; // Replace with actual path
            svgIcon.classList.add('custom-accordion-icon');
            svgIcon.alt = 'Accordion Toggle Icon';

            // Insert SVG at the end of the button
            button.appendChild(svgIcon);
        });
    }

 
    // Initialize all features
    setupHeroScale();
    setupHeroTranslation();
    setupCounters();
    setupAccordion();
    setupNavbar();
    addAccordionSvgIcons();
});