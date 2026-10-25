// --- 1. Smart Navbar & Mobile Menu ---
let lastScroll = 0;
const nav = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenuWrapper = document.getElementById('nav-menu-wrapper');

window.addEventListener('scroll', () => {
    if (navMenuWrapper && navMenuWrapper.classList.contains('active')) return;
    if (window.scrollY > lastScroll && window.scrollY > 100) {
        nav.classList.add('nav-hidden');
    } else {
        nav.classList.remove('nav-hidden');
    }
    lastScroll = window.scrollY;
}, { passive: true });

function closeMobileMenu() {
    if (navToggle) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    }
    if (navMenuWrapper) {
        navMenuWrapper.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function openMobileMenu() {
    if (navToggle) {
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
    }
    if (navMenuWrapper) {
        navMenuWrapper.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
}

if (navToggle && navMenuWrapper) {
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenuWrapper.classList.contains('active');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    navMenuWrapper.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    document.addEventListener('click', (e) => {
        if (navMenuWrapper.classList.contains('active') && !navMenuWrapper.contains(e.target) && !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenuWrapper.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// --- 2. Portfolio Tabs Logic ---
function switchTab(index) {
    const pill = document.getElementById('pill');
    const btns = document.querySelectorAll('.tab-btn');
    const filmsGrid = document.getElementById('films-grid');
    const eventsGrid = document.getElementById('events-grid');

    pill.style.transform = index === 0 ? 'translateX(0)' : 'translateX(100%)';

    btns.forEach((btn, i) => {
        btn.classList.toggle('tab-active', i === index);
    });

    if (index === 0) {
        eventsGrid.classList.remove('active');
        setTimeout(() => filmsGrid.classList.add('active'), 100);
    } else {
        filmsGrid.classList.remove('active');
        setTimeout(() => eventsGrid.classList.add('active'), 100);
    }
}

// --- 3. Global Modal Logic ---
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalActions = document.getElementById('modal-actions');

function openCardModal(buttonElement) {
    const card = buttonElement.closest('.film-card, .blog-card');
    if (!card) return;

    const cardType = card.getAttribute('data-type');
    const youtubeUrl = card.getAttribute('data-youtube') || 'https://www.youtube.com/@wlustpictures';
    const title = card.querySelector('.card-title') ? card.querySelector('.card-title').innerText : 'Details';

    // 1. Extract Image
    const imgEl = card.querySelector('.film-img, .blog-img');
    let mediaHTML = '';
    if (imgEl) {
        if (imgEl.tagName.toLowerCase() === 'img' && imgEl.getAttribute('src')) {
            const imgSrc = imgEl.getAttribute('src');
            mediaHTML = `<img src="${imgSrc}" alt="${title}" class="modal-card-image">`;
        } else {
            const imgLabel = imgEl.innerHTML;
            const bgImage = window.getComputedStyle(imgEl).backgroundImage;
            mediaHTML = `<div class="modal-card-image" style="background-image: ${bgImage};">${imgLabel}</div>`;
        }
    }

    // 2. Extract Metadata Spans
    const metaEl = card.querySelector('.film-meta, .blog-meta');
    const metaHTML = metaEl ? `<div class="modal-meta">${metaEl.innerHTML}</div>` : '';

    // 3. Extract Custom Hidden Paragraphs
    const customFullTextEl = card.querySelector('.card-full-text');
    let bodyTextHTML = '';
    if (customFullTextEl && customFullTextEl.innerHTML.trim() !== '') {
        bodyTextHTML = customFullTextEl.innerHTML;
    } else {
        const leadText = card.querySelector('p') ? card.querySelector('p').innerText : '';
        bodyTextHTML = `<p>${leadText}</p>`;
    }

    modalContent.innerHTML = `
        ${mediaHTML}
        ${metaHTML}
        <h3>${title}</h3>
        ${bodyTextHTML}
    `;

    // 4. Configure Footer Buttons
    if (cardType === 'film') {
        modalActions.innerHTML = `
            <a href="${youtubeUrl}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-solid fa-play" style="margin-right: 6px;"></i> Watch Now</a>
            <button class="btn btn-outline" onclick="closeModal()">Close</button>
        `;
    } else if (cardType === 'event') {
        modalActions.innerHTML = `
            <a href="${youtubeUrl}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-solid fa-play" style="margin-right: 6px;"></i> View Event</a>
            <button class="btn btn-outline" onclick="closeModal()">Close</button>
        `;
    } else {
        modalActions.innerHTML = `
            <button class="btn btn-outline" onclick="closeModal()">Close</button>
        `;
    }

    modalOverlay.style.display = 'flex';
    modalContent.scrollTop = 0;
    setTimeout(() => modalOverlay.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('show');
    setTimeout(() => {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
        closeModal();
    }
});

// --- 4. Automatic 6-Card Manual Carousel Paginator (For Portfolio Films & Events Only) ---
function initPaginatedGrids() {
    const sectionsToCheck = [
        { selector: '#films-grid', itemSelector: '.film-card' },
        { selector: '#events-grid', itemSelector: '.film-card' }
    ];

    sectionsToCheck.forEach(({ selector, itemSelector }) => {
        const container = document.querySelector(selector);
        if (!container) return;

        const items = Array.from(container.querySelectorAll(`:scope > ${itemSelector}`));

        // Center cards if there are fewer than 3
        if (items.length < 3) {
            container.classList.add('centered-cards');
            return;
        }

        // Only convert into a manual 6-card carousel if there are strictly more than 6 cards
        if (items.length <= 6) return;

        const itemsPerPage = 6;
        const totalPages = Math.ceil(items.length / itemsPerPage);
        let currentPage = 0;

        container.classList.add('paginated-mode');

        const shell = document.createElement('div');
        shell.className = 'paginated-carousel-shell';

        const mainRow = document.createElement('div');
        mainRow.className = 'paginated-carousel-main';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-arrow carousel-arrow-left';
        prevBtn.setAttribute('aria-label', 'Previous Page');
        prevBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

        const viewport = document.createElement('div');
        viewport.className = 'paginated-carousel-viewport';

        const track = document.createElement('div');
        track.className = 'paginated-carousel-track';

        const pageElements = [];
        for (let p = 0; p < totalPages; p++) {
            const page = document.createElement('div');
            page.className = `paginated-grid-page ${p === 0 ? 'is-active-page' : ''}`;
            const pageItems = items.slice(p * itemsPerPage, (p + 1) * itemsPerPage);
            pageItems.forEach(item => page.appendChild(item));
            track.appendChild(page);
            pageElements.push(page);
        }

        viewport.appendChild(track);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-arrow carousel-arrow-right';
        nextBtn.setAttribute('aria-label', 'Next Page');
        nextBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

        mainRow.appendChild(prevBtn);
        mainRow.appendChild(viewport);
        mainRow.appendChild(nextBtn);

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'carousel-dots';

        for (let p = 0; p < totalPages; p++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${p === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Page ${p + 1}`);
            dot.addEventListener('click', () => {
                currentPage = p;
                updatePage();
            });
            dotsWrap.appendChild(dot);
        }

        shell.appendChild(mainRow);
        shell.appendChild(dotsWrap);
        container.appendChild(shell);

        function updatePage() {
            // Account for both the 100% page width and the 80px gap between pages
            track.style.transform = `translateX(calc(-${currentPage * 100}% - ${currentPage * 80}px))`;

            pageElements.forEach((pageEl, idx) => {
                pageEl.classList.toggle('is-active-page', idx === currentPage);
            });

            const dots = dotsWrap.querySelectorAll('.carousel-dot');
            dots.forEach((d, idx) => d.classList.toggle('active', idx === currentPage));
        }

        prevBtn.addEventListener('click', () => {
            currentPage = (currentPage <= 0) ? totalPages - 1 : currentPage - 1;
            updatePage();
        });

        nextBtn.addEventListener('click', () => {
            currentPage = (currentPage >= totalPages - 1) ? 0 : currentPage + 1;
            updatePage();
        });
    });
}

initPaginatedGrids();

// --- 5. iOS Alarm Clock Number Wheel Animation for Achievements ---
function initAchievementWheels() {
    const statEls = document.querySelectorAll('.wheel-stat');
    statEls.forEach(statEl => {
        const rawVal = statEl.getAttribute('data-value') || statEl.innerText.trim();
        statEl.innerHTML = '';

        Array.from(rawVal).forEach((char, charIndex) => {
            if (/\d/.test(char)) {
                const targetDigit = parseInt(char, 10);
                const col = document.createElement('span');
                col.className = 'wheel-col';

                const totalSpins = 2;
                const totalSteps = totalSpins * 10 + targetDigit;

                for (let i = 0; i <= totalSteps; i++) {
                    const digitSpan = document.createElement('span');
                    digitSpan.className = 'wheel-digit';
                    digitSpan.textContent = i % 10;
                    col.appendChild(digitSpan);
                }

                col.dataset.targetSteps = totalSteps;
                col.dataset.delay = charIndex * 140;
                statEl.appendChild(col);
            } else {
                const staticSpan = document.createElement('span');
                staticSpan.className = 'wheel-static';
                staticSpan.textContent = char;
                statEl.appendChild(staticSpan);
            }
        });
    });
}

function spinAchievementWheels() {
    const cols = document.querySelectorAll('#stats-wheel-container .wheel-col');
    cols.forEach((col, idx) => {
        const steps = parseInt(col.dataset.targetSteps, 10);
        const delay = idx * 120;
        col.style.transition = `transform 1.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
        col.style.transform = `translateY(-${steps * 1.15}em)`;
    });
}

initAchievementWheels();

const statsContainer = document.getElementById('stats-wheel-container');
if (statsContainer) {
    const wheelObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => spinAchievementWheels());
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });
    wheelObserver.observe(statsContainer);
}

// --- 6. Intersection Observer for Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
revealElements.forEach(el => revealObserver.observe(el));

// --- 7. Reusable 3-Card Row Carousel Setup (Used for Testimonials [Auto] & Behind The Lens [Manual]) ---
function setupThreeCardRowCarousel({
    trackId,
    prevId,
    nextId,
    dotsId,
    viewportId,
    autoPlay = false,
    autoDelay = 5000
}) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsContainer = document.getElementById(dotsId);
    const viewport = document.getElementById(viewportId);

    if (!track || !prevBtn || !nextBtn || !dotsContainer || !viewport) return;

    const cards = Array.from(track.children);
    const totalCards = cards.length;
    let currentIndex = 0;
    let autoPlayTimer = null;

    function getCardsPerView() {
        if (window.innerWidth <= 680) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getMaxIndex() {
        const visible = getCardsPerView();
        return Math.max(0, totalCards - visible);
    }

    function updateLayoutAndControls() {
        const visible = getCardsPerView();
        // Needs carousel whenever cards exceed visible cards on the current screen size
        const needsCarousel = totalCards > visible;

        if (!needsCarousel) {
            track.classList.add('centered-mode');
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            dotsContainer.style.display = 'none';
            currentIndex = 0;
            track.style.transform = 'translateX(0px)';
            stopTimer();
        } else {
            track.classList.remove('centered-mode');
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            dotsContainer.style.display = 'flex';
            renderDots();
            updateSlidePosition();
            if (autoPlay) startTimer();
        }
    }

    // Touch Swipe Support for Mobile & Tablets
    let touchStartX = 0;
    let touchEndX = 0;
    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) advanceNext();
            else advancePrev();
            resetTimer();
        }
    }, { passive: true });

    function renderDots() {
        dotsContainer.innerHTML = '';
        const maxIdx = getMaxIndex();
        const totalDots = maxIdx + 1;
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateSlidePosition();
                if (autoPlay) resetTimer();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateSlidePosition() {
        const maxIdx = getMaxIndex();
        if (currentIndex > maxIdx) currentIndex = maxIdx;
        if (currentIndex < 0) currentIndex = 0;

        if (cards[0]) {
            const cardRect = cards[0].getBoundingClientRect();
            const trackStyles = window.getComputedStyle(track);
            const gap = parseFloat(trackStyles.gap) || 28;
            const shift = (cardRect.width + gap) * currentIndex;
            track.style.transform = `translateX(-${shift}px)`;
        }

        const allDots = dotsContainer.querySelectorAll('.carousel-dot');
        allDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });

        track.dispatchEvent(new CustomEvent('carousel:slide'));
    }

    function advanceNext() {
        const maxIdx = getMaxIndex();
        currentIndex = (currentIndex >= maxIdx) ? 0 : currentIndex + 1;
        updateSlidePosition();
    }

    function advancePrev() {
        const maxIdx = getMaxIndex();
        currentIndex = (currentIndex <= 0) ? maxIdx : currentIndex - 1;
        updateSlidePosition();
    }

    function startTimer() {
        if (!autoPlay || totalCards <= 3) return;
        stopTimer();
        autoPlayTimer = setInterval(advanceNext, autoDelay);
    }

    function stopTimer() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    function resetTimer() {
        if (autoPlay) startTimer();
    }

    nextBtn.addEventListener('click', () => {
        advanceNext();
        resetTimer();
    });

    prevBtn.addEventListener('click', () => {
        advancePrev();
        resetTimer();
    });

    if (autoPlay) {
        viewport.addEventListener('mouseenter', stopTimer);
        viewport.addEventListener('mouseleave', startTimer);
    }

    window.addEventListener('resize', updateLayoutAndControls);

    updateLayoutAndControls();
}

// Initialize Testimonials (Auto-Play enabled when > 3 cards, centered & hidden controls when <= 3)
setupThreeCardRowCarousel({
    trackId: 'testimonial-track',
    prevId: 'test-prev',
    nextId: 'test-next',
    dotsId: 'carousel-dots',
    viewportId: 'carousel-viewport',
    autoPlay: true,
    autoDelay: 5000
});

// Initialize Behind The Lens / Blog (Safely skips if section is omitted from HTML)
setupThreeCardRowCarousel({
    trackId: 'blog-track',
    prevId: 'blog-prev',
    nextId: 'blog-next',
    dotsId: 'blog-dots',
    viewportId: 'blog-viewport',
    autoPlay: false
});

// --- 7b. Testimonials Click & Hover Expansion (Mobile & Desktop) ---
function initTestimonialExpansion() {
    const testimonialTrack = document.getElementById('testimonial-track');
    if (!testimonialTrack) return;

    const cards = Array.from(testimonialTrack.querySelectorAll('.carousel-card'));
    if (!cards.length) return;

    // Desktop hover devices handle expansion naturally on hover (:hover in CSS).
    // They should NOT lock or toggle cards open on click.
    const isDesktopView = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 900;

    function toggleCard(cardToToggle) {
        const isCurrentlyExpanded = cardToToggle.classList.contains('is-expanded');

        // Collapse all other testimonial cards
        cards.forEach(otherCard => {
            if (otherCard !== cardToToggle && otherCard.classList.contains('is-expanded')) {
                otherCard.classList.remove('is-expanded');
            }
        });

        // Toggle the targeted card
        if (isCurrentlyExpanded) {
            cardToToggle.classList.remove('is-expanded');
        } else {
            cardToToggle.classList.add('is-expanded');
        }
    }

    cards.forEach(card => {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let touchMovedSignificantly = false;
        let lastTouchEndTime = 0;

        // Record touch start
        card.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                touchMovedSignificantly = false;
            }
        }, { passive: true });

        // Detect if touch was an intentional horizontal swipe or vertical page scroll
        card.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const dx = Math.abs(e.touches[0].clientX - touchStartX);
                const dy = Math.abs(e.touches[0].clientY - touchStartY);
                // Allow up to 20px finger jitter on tap; only flag as swipe/scroll if moved > 20px
                if (dx > 20 || dy > 20) {
                    touchMovedSignificantly = true;
                }
            }
        }, { passive: true });

        // Handle touchend for immediate, lag-free mobile tap response
        card.addEventListener('touchend', () => {
            if (isDesktopView()) return;
            const touchDuration = Date.now() - touchStartTime;
            // If it was a clean tap (didn't drag > 20px and lasted < 500ms)
            if (!touchMovedSignificantly && touchDuration < 500) {
                lastTouchEndTime = Date.now();
                toggleCard(card);
            }
        }, { passive: true });

        // Click listener: only activate on mobile/touch devices
        card.addEventListener('click', () => {
            // On desktop view, hover expands and collapses automatically.
            // Do not toggle or keep card expanded on desktop click.
            if (isDesktopView()) {
                return;
            }
            // Prevent synthetic double-fire within 400ms of a touchend
            if (Date.now() - lastTouchEndTime < 400) {
                return;
            }
            toggleCard(card);
        });
    });

    // Collapse open cards when navigating the carousel, clicking outside, or resizing to desktop
    const collapseAll = () => {
        cards.forEach(card => {
            if (card.classList.contains('is-expanded')) {
                card.classList.remove('is-expanded');
            }
        });
    };

    // Close any expanded cards on window resize if transitioned to desktop
    window.addEventListener('resize', () => {
        if (isDesktopView()) {
            collapseAll();
        }
    });

    // Tap outside to collapse on mobile/touch
    document.addEventListener('click', (e) => {
        if (isDesktopView()) return;
        if (!e.target.closest('.carousel-card') && !e.target.closest('.carousel-arrow') && !e.target.closest('#carousel-dots')) {
            collapseAll();
        }
    });

    const prevBtn = document.getElementById('test-prev');
    const nextBtn = document.getElementById('test-next');
    if (prevBtn) prevBtn.addEventListener('click', collapseAll);
    if (nextBtn) nextBtn.addEventListener('click', collapseAll);
    const dotsWrap = document.getElementById('carousel-dots');
    if (dotsWrap) dotsWrap.addEventListener('click', collapseAll);
    testimonialTrack.addEventListener('carousel:slide', collapseAll);
}

initTestimonialExpansion();

// --- 8. 3D Tilt Effect (Only on desktop / hover-capable devices) ---
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 12;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(40px) scale3d(1.035, 1.035, 1.035)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)`;
            card.style.transition = `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`;
        });
        card.addEventListener('mouseenter', () => { card.style.transition = `transform 0.15s ease-out`; });
    });
}

// --- 9. Three.js Volumetric Smoke Setup ---
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.0012);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.z = 850;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function createSmokeTexture() {
    const smokeCanvas = document.createElement('canvas');
    smokeCanvas.width = 256; smokeCanvas.height = 256;
    const ctx = smokeCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(235, 238, 245, 0.85)');
    grad.addColorStop(0.3, 'rgba(175, 180, 192, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(smokeCanvas);
}

scene.add(new THREE.DirectionalLight(0xffffff, 0.85));
scene.add(new THREE.AmbientLight(0x28282c));

const smokeMaterial = new THREE.MeshLambertMaterial({ map: createSmokeTexture(), transparent: true, opacity: 0.25, depthWrite: false });
const smokeGeo = new THREE.PlaneGeometry(360, 360);
const smokeParticles = [];
const smokeGroup = new THREE.Group();
scene.add(smokeGroup);

for (let i = 0; i < 110; i++) {
    const mesh = new THREE.Mesh(smokeGeo, smokeMaterial);
    mesh.position.set((Math.random() - 0.5) * 1100, (Math.random() - 0.5) * 1300, Math.random() * 800 - 350);
    mesh.rotation.z = Math.random() * Math.PI * 2;
    mesh.userData = { rotSpeed: (Math.random() - 0.5) * 0.0025, driftX: (Math.random() - 0.5) * 0.08, driftY: (Math.random() - 0.5) * 0.06 };
    smokeGroup.add(mesh);
    smokeParticles.push(mesh);
}

let currentScrollY = window.scrollY;
let targetScrollY = window.scrollY;
window.addEventListener('scroll', () => { targetScrollY = window.scrollY; }, { passive: true });

function animate() {
    requestAnimationFrame(animate);
    currentScrollY += (targetScrollY - currentScrollY) * 0.055;
    camera.position.y += (-currentScrollY * 0.5 - camera.position.y) * 0.035;
    camera.lookAt(0, camera.position.y, 0);
    smokeGroup.rotation.z = currentScrollY * 0.0005;

    smokeParticles.forEach(p => {
        p.rotation.z += p.userData.rotSpeed;
        p.position.x += p.userData.driftX;
        p.position.y += p.userData.driftY;
        if (p.position.x > 650) p.position.x = -650;
        if (p.position.x < -650) p.position.x = 650;
    });
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
});