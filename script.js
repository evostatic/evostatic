import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

// Initialize Lucide icons
if (window.lucide) {
    window.lucide.createIcons();
}

/* --- Theme Toggle --- */
function initTheme() {
    const html = document.documentElement;
    const toggleBtns = [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-mobile')];
    
    // Check preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        updateIcons(true);
    } else {
        html.classList.remove('dark');
        updateIcons(false);
    }

    function updateIcons(isDark) {
        const moons = document.querySelectorAll('.theme-icon-moon');
        const suns = document.querySelectorAll('.theme-icon-sun');
        
        moons.forEach(el => el.classList.toggle('hidden', isDark));
        suns.forEach(el => el.classList.toggle('hidden', !isDark));
    }

    toggleBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcons(isDark);
            
            // Update spark color
            if (window.updateSparkColor) {
                window.updateSparkColor(isDark ? '#fff' : '#3A29FF');
            }
        });
    });
}
initTheme();

/* --- Mobile Menu --- */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const links = document.querySelectorAll('.mobile-link');

    if (!btn || !menu) return;

    function toggleMenu() {
        const isHidden = menu.classList.contains('hidden');
        menu.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden', isHidden);
        closeIcon.classList.toggle('hidden', !isHidden);
    }

    btn.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        });
    });
}
initMobileMenu();

/* --- Navbar Scroll Effect --- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('bg-white/80', 'dark:bg-black/80', 'backdrop-blur-xl', 'border-border', 'shadow-sm');
            navbar.classList.remove('bg-transparent', 'border-transparent');
        } else {
            navbar.classList.remove('bg-white/80', 'dark:bg-black/80', 'backdrop-blur-xl', 'border-border', 'shadow-sm');
            navbar.classList.add('bg-transparent', 'border-transparent');
        }
    });
}
initNavbar();

/* --- Scroll Reveal --- */
function initScrollReveal() {
    // Single elements
    const singleElements = document.querySelectorAll('.reveal-element');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('reveal-hidden');
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    singleElements.forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });

    // Grouped elements (cards, portfolio)
    const revealGroups = document.querySelectorAll('.reveal-group');
    const groupObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.reveal-item');
                items.forEach(item => {
                    const delay = item.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        item.classList.remove('opacity-0', 'translate-y-12', 'translate-y-10');
                        item.classList.add('opacity-100', 'translate-y-0');
                    }, parseInt(delay));
                });
                groupObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealGroups.forEach(group => {
        const items = group.querySelectorAll('.reveal-item');
        items.forEach(item => {
            item.classList.add('opacity-0', 'translate-y-12');
        });
        groupObserver.observe(group);
    });
    
    // Hero specific reveal
    setTimeout(() => {
        const hero = document.getElementById('hero-content');
        if(hero) {
            hero.classList.remove('reveal-hidden');
            hero.classList.add('reveal-visible');
        }
    }, 100);
}
initScrollReveal();

/* --- Stats Counter --- */
function initStats() {
    const stats = document.querySelectorAll('.stat-counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                const suffix = el.getAttribute('data-suffix');
                animateCounter(el, target, suffix);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));

    function animateCounter(el, target, suffix) {
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                el.textContent = target + suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(start) + suffix;
            }
        }, 16);
    }
}
initStats();

/* --- Aurora WebGL Animation --- */
function initAurora() {
    console.log('Initializing Aurora...');
    const ctn = document.getElementById('aurora-container');
    if (!ctn) return;

    const VERT = `#version 300 es
    in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
    `;

    const FRAG = `#version 300 es
    precision highp float;

    uniform float uTime;
    uniform float uAmplitude;
    uniform vec3 uColorStops[3];
    uniform vec2 uResolution;
    uniform float uBlend;

    out vec4 fragColor;

    vec3 permute(vec3 x) {
      return mod(((x * 34.0) + 1.0) * x, 289.0);
    }

    float snoise(vec2 v){
      const vec4 C = vec4(
          0.211324865405187, 0.366025403784439,
          -0.577350269189626, 0.024390243902439
      );
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);

      vec3 p = permute(
          permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0)
      );

      vec3 m = max(
          0.5 - vec3(
              dot(x0, x0),
              dot(x12.xy, x12.xy),
              dot(x12.zw, x12.zw)
          ), 
          0.0
      );
      m = m * m;
      m = m * m;

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    struct ColorStop {
      vec3 color;
      float position;
    };

    #define COLOR_RAMP(colors, factor, finalColor) {              \
      int index = 0;                                            \
      for (int i = 0; i < 2; i++) {                               \
         ColorStop currentColor = colors[i];                    \
         bool isInBetween = currentColor.position <= factor;    \
         index = int(mix(float(index), float(i), float(isInBetween))); \
      }                                                         \
      ColorStop currentColor = colors[index];                   \
      ColorStop nextColor = colors[index + 1];                  \
      float range = nextColor.position - currentColor.position; \
      float lerpFactor = (factor - currentColor.position) / range; \
      finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      
      ColorStop colors[3];
      colors[0] = ColorStop(uColorStops[0], 0.0);
      colors[1] = ColorStop(uColorStops[1], 0.5);
      colors[2] = ColorStop(uColorStops[2], 1.0);
      
      vec3 rampColor;
      COLOR_RAMP(colors, uv.x, rampColor);
      
      float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
      height = exp(height);
      height = (uv.y * 2.0 - height + 0.2);
      float intensity = 0.6 * height;
      
      float midPoint = 0.20;
      float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
      
      vec3 auroraColor = intensity * rampColor;
      
      fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
    }
    `;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    // Explicit sizing
    gl.canvas.style.display = 'block';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    
    ctn.appendChild(gl.canvas);

    let program;

    // Flipped colors as requested: Red -> Pink -> Blue
    const colorStopsHex = ["#FF3232", "#FF94B4", "#3A29FF"];
    
    // Flatten array for OGL uniform: [r, g, b, r, g, b, r, g, b]
    const colorStopsArray = [];
    colorStopsHex.forEach(hex => {
        const c = new Color(hex);
        colorStopsArray.push(c.r, c.g, c.b);
    });

    function resize() {
        // Ensure container has size
        const width = ctn.offsetWidth;
        const height = ctn.offsetHeight;
        
        if (width === 0 || height === 0) return;
        
        renderer.setSize(width, height);
        if (program) {
            program.uniforms.uResolution.value = [width, height];
        }
    }
    window.addEventListener('resize', resize);
    window.addEventListener('load', resize); // Force resize on load

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: 1.0 },
            uColorStops: { value: colorStopsArray },
            uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
            uBlend: { value: 0.5 }
        }
    });

    const mesh = new Mesh(gl, { geometry, program });

    let animateId = 0;
    // Match React speed: speed (0.5) * 0.1 in the loop
    const speed = 0.5;
    
    function update(t) {
        animateId = requestAnimationFrame(update);
        const time = t * 0.01; // Matches React time scaling roughly
        if (program) {
            program.uniforms.uTime.value = time * speed * 0.1;
            renderer.render({ scene: mesh });
        }
    }
    animateId = requestAnimationFrame(update);
    
    // Initial resize call
    resize();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAurora);
} else {
    initAurora();
}

/* --- Click Spark --- */
function initClickSpark() {
    const canvas = document.getElementById('click-spark-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let sparks = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    let currentSparkColor = document.documentElement.classList.contains('dark') ? '#fff' : '#3A29FF';

    // Expose updater for theme toggle
    window.updateSparkColor = (color) => {
        currentSparkColor = color;
    };

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Config matches React component
    const sparkSize = 10;
    const sparkRadius = 15;
    const sparkCount = 8;
    const duration = 400;

    function easeOut(t) {
        return t * (2 - t);
    }

    document.addEventListener('click', (e) => {
        const now = performance.now();
        const x = e.clientX;
        const y = e.clientY;
        
        for(let i = 0; i < sparkCount; i++) {
            sparks.push({
                x,
                y,
                angle: (2 * Math.PI * i) / sparkCount,
                startTime: now
            });
        }
    });

    function draw(timestamp) {
        ctx.clearRect(0, 0, width, height);

        sparks = sparks.filter(spark => {
            const elapsed = timestamp - spark.startTime;
            if (elapsed >= duration) return false;

            const progress = elapsed / duration;
            const eased = easeOut(progress);

            const distance = eased * sparkRadius;
            const lineLength = sparkSize * (1 - eased);

            const x1 = spark.x + distance * Math.cos(spark.angle);
            const y1 = spark.y + distance * Math.sin(spark.angle);
            const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
            const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

            ctx.strokeStyle = currentSparkColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            return true;
        });

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}
initClickSpark();
