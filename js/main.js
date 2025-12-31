// Main.js - Portfolio Logic
import '../css/style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import emailjs from '@emailjs/browser';
import Lenis from '@studio-freight/lenis';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initCursor();
    initThreeJS();
    initScrollAnimations();
    initVideoBackground();
    loadProjects();
    initContactForm();
    initMobileMenu();
    initPhase3(); // Ultra-Premium Features
});

// --- 0. Smooth Scroll (Lenis) ---
function initLenis() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false, // Default is false, which is good for perf
        touchMultiplier: 2,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// --- 1. Custom Cursor ---
function initCursor() {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.createElement('div');
    cursor.id = 'cursor';
    document.body.appendChild(cursor);

    // Optimize: Use requestAnimationFrame for smoother cursor
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth lerp
    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.2; // Smoothness factor
        cursorY += dy * 0.2;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        // Fixed: Use transform instead of top/left for performance (no layout thrashing)
        // Note: CSS #cursor needs update to remove top/left dependency if we use translate globally, 
        // but for now let's just use fixed position + transform. 
        // Actually, let's keep it simple: direct assign but use transform.
        cursor.style.left = '0px';
        cursor.style.top = '0px';
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`; // Hardware accelerated

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverTargets = document.querySelectorAll('a, button, .project-card, input, textarea');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}

// --- 2. Advanced Three.js Background (Blue Lava Shader) ---
function initThreeJS() {

    const canvas = document.getElementById('bg-canvas') || document.createElement('canvas');
    if (!canvas.id) {
        canvas.id = 'bg-canvas';
        document.body.prepend(canvas);
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); // Disable AA for perf
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5x for performance

    // --- SHADER CODE (Liquid Glass / Ultra Smooth) ---
    const vertexShader = `
        uniform float uTime;
        varying vec2 vUv;
        varying float vDisplacement;
        varying vec3 vNormal;

        // Simplex 3D Noise 
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        
        float snoise(vec3 v){ 
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            
            // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            
            // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            
            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
            
            // Permutations
            i = mod(i, 289.0 ); 
            vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            
            // Gradients
            float n_ = 1.0/7.0; // N=7
            vec3  ns = n_ * D.wyz - D.xzx;
            
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N*N)
            
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
            
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            
            //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            
            // Mix
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                        dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
            vUv = uv;
            vNormal = normal;
            
            // Smooth, Flowing Noise (Low Frequency, No Turbulence)
            float noiseVal = snoise(position * 0.5 + uTime * 0.2); 
            
            vDisplacement = noiseVal; 
            
            // Smooth displacement
            vec3 newPos = position + normal * (noiseVal * 1.5);
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        varying float vDisplacement;
        varying vec3 vNormal;

        void main() {
            // "Updated" Premium Palette with Iridescence
            vec3 colorDeep = vec3(0.0, 0.02, 0.1);   // Darker Void Blue
            vec3 colorMid = vec3(0.02, 0.2, 0.8);    // Rich Cobalt
            vec3 colorHighlight = vec3(0.0, 0.8, 1.0); // Electric Cyan
            
            // Smooth mix
            float mixVal = smoothstep(-0.8, 0.8, vDisplacement);
            
            vec3 baseColor = mix(colorDeep, colorMid, mixVal);
            
            // Iridescent/Chromatic Aberration Fake
            // Shift colors slightly based on normal angle for "pearlescent" look
            float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
            fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
            fresnel = pow(fresnel, 2.0);

            vec3 iridescent = vec3(fresnel * 0.5, fresnel * 0.2, fresnel * 0.8); // Purple/Blue tint
            
            // Specular-like reflection based on view
            float viewDir = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
            float rim = 1.0 - max(viewDir, 0.0);
            rim = pow(rim, 3.0); 
            
            vec3 finalColor = baseColor + iridescent * 0.3;
            
            // Add sharp rim light
            finalColor += vec3(0.6, 0.9, 1.0) * rim * 1.2;
            
            // Internal glow
            finalColor += colorHighlight * 0.1 * (vDisplacement + 0.5);

            gl_FragColor = vec4(finalColor, 0.9); // Slightly more opaque
        }
    `;

    // Geometry - Increase resolution for "Perfect" smoothness
    // Optimization: Reduced segments from 128 to 64 for mobile performance
    const isMobile = window.innerWidth < 768;
    const segments = isMobile ? 48 : 96; // 48 is decent for mobile, 96 for desktop
    const geometry = new THREE.SphereGeometry(6, segments, segments);

    // Material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        // wireframe: true // Debug mode
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // --- Interaction ---
    let mouseX = 0;
    let mouseY = 0;

    // Lerp variables for smooth rotation
    let targetRotationX = 0;
    let targetRotationY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.0005;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.0005;
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Update Shader Uniforms
        material.uniforms.uTime.value = elapsedTime;

        // Smooth Rotation Lerp
        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.5;

        sphere.rotation.z += (targetRotationY - sphere.rotation.z) * 0.05; // Smooth ease
        sphere.rotation.x += (targetRotationX - sphere.rotation.x) * 0.05;

        // Subtle total rotation
        sphere.rotation.y = elapsedTime * 0.15; // Slightly faster for more "life"

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- Mobile Menu Logic ---
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const links = document.querySelectorAll('.mobile-link');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const isOpen = menu.classList.contains('hidden'); // Check if currently hidden
        if (isOpen) {
            menu.classList.remove('hidden');
            gsap.fromTo(menu, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3 });
            btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-white" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
        } else {
            gsap.to(menu, { opacity: 0, y: -20, duration: 0.3, onComplete: () => menu.classList.add('hidden') });
            btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-white" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            gsap.to(menu, { opacity: 0, y: -20, duration: 0.3, onComplete: () => menu.classList.add('hidden') });
            btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-white" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
        });
    });
}

// --- 3. Video Background Logic ---
function initVideoBackground() {
    const video = document.getElementById('about-video');
    if (!video) return;

    // Start paused
    video.pause();

    // Logic Vars
    let hasPausedForName = false;
    const PAUSE_TIME = 3;      // Seconds to pause at
    const PAUSE_DURATION = 3000; // Milliseconds to wait

    // 1. Intersection Observer: Just Play/Pause based on visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Play immediately when visible
                video.play().catch(e => console.log("Auto-play blocked:", e));
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.1 }); // 10% visible is enough

    observer.observe(video);

    // 2. Time Update: Pause at specific timestamp once per session/loop
    video.addEventListener('timeupdate', () => {
        if (!hasPausedForName && video.currentTime >= PAUSE_TIME && video.currentTime < PAUSE_TIME + 0.5) {
            // Check range to avoid multiple triggers
            video.pause();
            hasPausedForName = true;

            setTimeout(() => {
                video.play().catch(e => console.log("Resume failed:", e));
            }, PAUSE_DURATION);
        }
    });

    // 3. Reset logic on loop (optional, if we want it to pause every time it loops, uncomment below)
    // video.addEventListener('ended', () => { hasPausedForName = false; });
}

// --- 4. Scroll Animations (GSAP) ---
function initScrollAnimations() {

    // General Section Reveal
    const sections = document.querySelectorAll('.reveal-section');
    sections.forEach(section => {
        gsap.fromTo(section,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Specific Skills Stagger
    // We target the skills container to stagger its children (columns or cards)
    const skillGroups = document.querySelectorAll('.skills-container .space-y-6');
    if (skillGroups.length > 0) {
        gsap.fromTo(skillGroups,
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2, // Stagger columns
                ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: '.skills-container',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Glitch Text Trigger
    const glitchText = document.querySelector('.hero-title');
    if (glitchText) {
        gsap.to(glitchText, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'expo.out',
            delay: 0.5
        });
    }
}

// --- 5. Projects Fetcher ---
// --- 5. Projects Fetcher with Pagination ---
let allRepos = [];
const ITEMS_PER_PAGE = 6;
let currentPage = 1;

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    try {
        const username = 'Ayaansiddiq07';
        // Fetch up to 100 repos sorted by updated
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await response.json();

        if (!Array.isArray(repos)) throw new Error('Invalid Git data');

        allRepos = repos;

        if (allRepos.length === 0) {
            grid.innerHTML = '<p class="text-gray-500 text-center col-span-full">No active projects found.</p>';
            return;
        }

        renderProjects(1);

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full">Failed to load projects. System Offline.</p>';
    }
}

function renderProjects(page) {
    const grid = document.getElementById('projects-grid');
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageRepos = allRepos.slice(start, end);

    grid.innerHTML = '';

    pageRepos.forEach((repo, index) => {
        const card = document.createElement('div');
        // Initial state for animation
        card.className = 'project-card glass-panel p-6 rounded-xl relative overflow-hidden group opacity-0 translate-y-4';
        card.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 class="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">${repo.name}</h3>
            <p class="text-gray-400 text-sm mb-4 line-clamp-3">${repo.description || 'No description available.'}</p>
            <div class="flex justify-between items-center mt-auto">
                <span class="text-xs uppercase tracking-wider text-gray-500 border border-gray-800 px-2 py-1 rounded">${repo.language || 'Code'}</span>
                <a href="${repo.html_url}" target="_blank" class="text-cyan-400 hover:text-white transition-colors">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
            </div>
        `;
        grid.appendChild(card);

        // GSAP Fade In with stagger
        gsap.to(card, { opacity: 1, y: 0, duration: 0.4, delay: index * 0.1, ease: 'power2.out' });
    });

    currentPage = page;
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('projects-pagination');
    if (!container) return; // Should exist if HTML updated

    const totalPages = Math.ceil(allRepos.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        container.innerHTML = ''; // Hide dots if only 1 page
        return;
    }

    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('button');
        const isActive = i === currentPage;
        // Styling: Active = Neon Cyan Glow, Inactive = Dark Gray
        // Added aria-label for accessibility
        dot.setAttribute('aria-label', `Page ${i}`);
        dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${isActive ? 'bg-cyan-400 scale-125 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-gray-700 hover:bg-gray-500'}`;

        dot.onclick = () => renderProjects(i);
        container.appendChild(dot);
    }
}

// --- 6. Contact Form ---
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Transmitting...';
        btn.disabled = true;

        // Mock send (or implement EmailJS)
        try {
            // Using imported emailjs
            // emailjs.init("9aDFHA4whx9CYlrG4"); // Public Key - explicitly init if needed or rely on sendForm

            // Note: emailjs.sendForm automatically initializes if key is passed or if initialized before
            // We'll auto-init here just in case, or use the object
            // Actually, best practice with module:
            // emailjs.init(...);

            await emailjs.sendForm('service_o0382pf', 'template_kdldom7', form, '9aDFHA4whx9CYlrG4');
            alert('Message Transmitted Successfully');
            form.reset();
        } catch (err) {
            console.error("EmailJS Error:", err);
            alert('Transmission Failed');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// --- 7. Phase 3: Ultra-Premium Features (Magnetic & Spotlight) ---
function initPhase3() {

    // A. Magnetic Buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn, .magnetic-icon');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move button towards mouse (Magnetic Pull)
            gsap.to(btn, {
                x: x * 0.3, // Pull strength
                y: y * 0.3,
                rotate: x * 0.05, // Subtle tilt
                duration: 0.5,
                ease: 'power3.out'
            });

            // Move inner content slightly more for parallax depth (if exists)
            const inner = btn.querySelector('span, svg');
            if (inner) {
                gsap.to(inner, {
                    x: x * 0.1,
                    y: y * 0.1,
                    duration: 0.5,
                    ease: 'power3.out'
                });
            }
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, rotate: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
            const inner = btn.querySelector('span, svg');
            if (inner) {
                gsap.to(inner, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
            }
        });
    });

    // B. Spotlight Cards (Project & Skills) - Add class via JS if not present
    const cards = document.querySelectorAll('.project-card, .skill-card');
    cards.forEach(card => card.classList.add('spotlight-card'));

    document.addEventListener('mousemove', (e) => {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Only update if near/inside to save perf
            // Using logic to check visibility could save resources, but direct setter is fast enough
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    });

    // C. Parallax Footer Text
    const footerText = document.querySelector('footer h2');
    if (footerText) {
        gsap.to(footerText, {
            y: -50,
            scrollTrigger: {
                trigger: 'footer',
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 1
            }
        });
    }
}
