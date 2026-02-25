// Smooth momentum scroll (Lenis)
const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Carousel functionality - the CSS animation handles the scrolling

let revealObserver = null;

document.addEventListener('DOMContentLoaded', function () {
    // Hamburger menu toggle
    const hamburger =
        document.getElementById('hamburger') ||
        document.querySelector('.hamburger');
    const navLinks =
        document.getElementById('navLinks') ||
        document.querySelector('.navigation-link');
    const navOverlay =
        document.getElementById('navOverlay') ||
        document.querySelector('.nav-overlay');

    function openNav() {
        navLinks.classList.add('nav-open');
        navOverlay.classList.add('is-visible');
        hamburger.classList.add('is-open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        navLinks.classList.remove('nav-open');
        navOverlay.classList.remove('is-visible');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (hamburger && navLinks && navOverlay) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.contains('is-open') ? closeNav() : openNav();
        });
        navOverlay.addEventListener('click', closeNav);
        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeNav);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeNav();
        });
    }

    if (
        typeof Swiper !== 'undefined' &&
        document.querySelector('.projectSwiper')
    ) {
        const swiper = new Swiper('.projectSwiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                },
            },
        });
    }

    // Scroll reveal
    revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
    });

    // Load footer partial
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('assets/partials/footer.html')
            .then((res) => res.text())
            .then((html) => {
                footerPlaceholder.outerHTML = html;
                document.querySelectorAll('.footer .reveal').forEach((el) => {
                    revealObserver.observe(el);
                });
            });
    }

    // Navbar color switcher on scroll
    const nav = document.querySelector('.main-nav');
    const navColorMap = {
        home: 'nav-home',
        about: 'nav-about',
        projects: 'nav-projects',
        skills: 'nav-skills',
        tools: 'nav-tools',
        contact: 'nav-contact',
    };
    const allNavClasses = Object.values(navColorMap);

    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const colorClass = navColorMap[id];
                    if (colorClass) {
                        nav.classList.remove(...allNavClasses);
                        nav.classList.add(colorClass);
                    }
                }
            });
        },
        { threshold: 0.4 }
    );

    sections.forEach((section) => observer.observe(section));

    // Highlight active nav link based on current page
    const currentPage =
        window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navigation-link a').forEach((link) => {
        const linkPage = link.getAttribute('href');
        if (
            linkPage === currentPage ||
            (currentPage === '' && linkPage === 'index.html')
        ) {
            link.classList.add('nav-active');
        }
    });

    // Smooth navbar anchor scrolling via Lenis
    document
        .querySelectorAll('.navigation-link a[href^="#"]')
        .forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(
                    link.getAttribute('href')
                );
                if (target) {
                    lenis.scrollTo(target, { duration: 1.6, offset: -80 });
                }
            });
        });

    const journeyTabs = document.querySelectorAll('.journey-tab[data-target]');
    const journeyPanels = document.querySelectorAll('.journey-panel');

    if (journeyTabs.length && journeyPanels.length) {
        journeyTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                if (tab.classList.contains('is-active')) {
                    return;
                }

                const target = tab.getAttribute('data-target');

                journeyTabs.forEach((item) => {
                    item.classList.remove('is-active');
                    item.setAttribute('aria-selected', 'false');
                });

                journeyPanels.forEach((panel) => {
                    panel.classList.remove('is-active');
                    panel.setAttribute('hidden', 'hidden');
                });

                tab.classList.add('is-active');
                tab.setAttribute('aria-selected', 'true');

                const activePanel = document.getElementById(
                    `journey-panel-${target}`
                );

                if (activePanel) {
                    activePanel.classList.add('is-active');
                    activePanel.removeAttribute('hidden');
                }
            });
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', sendMail);
    }
});

function sendMail(event) {
    if (event) {
        event.preventDefault();
    }

    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        return;
    }

    if (typeof emailjs === 'undefined') {
        showContactNotice(
            'Email service is not available right now. Please try again later.',
            'error'
        );
        return;
    }

    const formData = new FormData(contactForm);
    const fullName = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    const parms = {
        name: fullName,
        fullname: fullName,
        from_name: fullName,
        email: email,
        from_email: email,
        reply_to: email,
        message: message,
    };

    emailjs
        .send('service_j9nv15k', 'template_fyccbge', parms)
        .then(() => {
            showContactNotice('Message sent successfully.', 'success');
            contactForm.reset();
        })
        .catch((error) => {
            showContactNotice(
                'Failed to send message. Please try again.',
                'error'
            );
            console.error('EmailJS error:', {
                status: error?.status,
                text: error?.text,
                details: error,
            });
        });
}

let contactNoticeTimeoutId = null;
let contactNoticeCleanupTimeoutId = null;

function showContactNotice(message, type) {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        return;
    }

    let notice = document.getElementById('contactNotice');

    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'contactNotice';
        notice.className = 'cf-notice';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        contactForm.prepend(notice);
    }

    notice.textContent = message;
    notice.classList.remove('is-success', 'is-error', 'is-visible');
    notice.classList.add(type === 'error' ? 'is-error' : 'is-success');

    requestAnimationFrame(() => {
        notice.classList.add('is-visible');
    });

    if (contactNoticeTimeoutId) {
        clearTimeout(contactNoticeTimeoutId);
    }

    if (contactNoticeCleanupTimeoutId) {
        clearTimeout(contactNoticeCleanupTimeoutId);
    }

    contactNoticeTimeoutId = setTimeout(() => {
        notice.classList.remove('is-visible');

        contactNoticeCleanupTimeoutId = setTimeout(() => {
            if (!notice.classList.contains('is-visible')) {
                notice.remove();
            }
        }, 220);
    }, 4500);
}
