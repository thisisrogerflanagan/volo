/**
 * Volo Mechanical Flip Logic
 * Static Demo & Real-Time Date/Time Customizer
 */

const CONFIG = { CHARACTERS: " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:" };
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 4);

const LUME_COLORS = [
    { name: 'Electric Red', hex: '#F51C18' }, { name: 'Sunset Orange', hex: '#FE8E04' },
    { name: 'Soft Lavender', hex: '#ADA5FA' }, { name: 'Bubblegum Pink', hex: '#FC9BB9' },
    { name: 'Mint Green', hex: '#93D4BE' }, { name: 'Sky Blue', hex: '#80E6FE' },
    { name: 'Cyan Neon', hex: '#0AECFD' }, { name: 'Peach Glow', hex: '#FECF9F' },
    { name: 'Vibrant Lime', hex: '#32F432' }, { name: 'Seafoam Glow', hex: '#0DF9D2' },
    { name: 'Lemon Yellow', hex: '#FEE54A' }, { name: 'Spring Green', hex: '#9EFFAC' },
    { name: 'Aqua Ice', hex: '#7DFDFD' }, { name: 'Pure White', hex: '#F6F6F6' }
];

class FlipSlot {
  constructor(el) {
    this.element = el;
    this.currentValue = el.getAttribute('data-value') || ' ';
    this.divs = Array.from(el.querySelectorAll('div'));
    this.activeAnimations = [];
    
    this.divs.forEach(div => {
        const shadow = document.createElement('div');
        shadow.className = 'flip-shadow';
        div.appendChild(shadow);
    });
    
    this.isFlipping = false;
    this.updateView(this.currentValue);
  }

  updateView(char) {
    this.divs.forEach(div => {
      const shadow = div.querySelector('.flip-shadow');
      div.innerText = char;
      if (shadow) div.appendChild(shadow);
    });
    this.currentValue = char;
  }

  cancelAnimations() {
      this.activeAnimations.forEach(anim => anim.cancel());
      this.activeAnimations = [];
  }

  async flip(targetChar, speedPreset = 'classic', delay = 0) {
    if (this.isFlipping) {
        this.cancelAnimations();
    }
    
    this.isFlipping = true;
    const [uT, uB, fT, fB] = this.divs;
    const shadows = this.divs.map(d => d.querySelector('.flip-shadow'));
    
    const totalFlips = 12; 
    let count = 0;
    
    // WHIMSY: The 'Mechanical Hiccup' (0.1% chance)
    const hasHiccup = Math.random() < 0.001;
    const finalFlipTarget = hasHiccup ? totalFlips + 2 : totalFlips;
    
    const min = speedPreset === 'slow' ? 180 : (speedPreset === 'fast' ? 40 : 80);
    const max = speedPreset === 'slow' ? 600 : (speedPreset === 'fast' ? 200 : 350);
    
    while (count < finalFlipTarget) {
      let duration = (finalFlipTarget - count <= 8) ? min + (max - min) * easeOutCubic(1 - (finalFlipTarget - count) / 8) : min;
      
      // If we're in a hiccup, the last few flips feel like a struggle
      if (hasHiccup && count >= totalFlips) {
          duration = 30 + Math.random() * 50; // Rapid micro-stutter
      }

      let nextChar = (finalFlipTarget - count > 1) ? CONFIG.CHARACTERS[Math.floor(Math.random() * CONFIG.CHARACTERS.length)] : targetChar;
      
      this.updateView(nextChar);
      
      const anims = [
        uB.animate([{ transform: 'rotateX(180deg)' }, { transform: 'rotateX(0deg)' }], { duration, delay: count === 0 ? delay : 0, fill: 'both' }),
        fT.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-180deg)' }], { duration, delay: count === 0 ? delay : 0, fill: 'both' }),
        shadows[0].animate({ opacity: [0.6, 0] }, { duration, fill: 'both' }),
        shadows[1].animate({ opacity: [1, 0] }, { duration, fill: 'both' }),
        shadows[2].animate({ opacity: [0, 1] }, { duration, fill: 'both' }),
        shadows[3].animate({ opacity: [0, 0.6] }, { duration, fill: 'both' })
      ];

      this.activeAnimations = anims;
      await Promise.allSettled(anims.map(a => a.finished));
      
      this.currentValue = nextChar;
      count++;
    }
    
    this.updateView(this.currentValue);
    this.isFlipping = false;
  }
}

const Customizer = {
    theme: 'dark',
    lumeColor: '#0DF9D2',
    
    init() {
        this.section = document.querySelector('.customizer-section');
        this.swatchesContainer = document.getElementById('lumeSwatches');
        this.colorPicker = document.querySelector('.color-swatches');
        
        this.setupToggles();
        this.initSwatches();
    },
    
    setupToggles() {
        const btns = document.querySelectorAll('.btn-toggle');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.setTheme(theme);
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },
    
    setTheme(theme) {
        this.theme = theme;
        this.section.setAttribute('data-theme', theme);
        if (theme === 'lume') {
            this.colorPicker.classList.add('show');
            this.section.style.setProperty('--lume-color', this.lumeColor);
        } else {
            this.colorPicker.classList.remove('show');
        }
    },
    
    initSwatches() {
        if (!this.swatchesContainer) return;
        this.swatchesContainer.innerHTML = ''; // Clear existing
        LUME_COLORS.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            if (color.hex.toLowerCase() === this.lumeColor.toLowerCase()) swatch.classList.add('active');
            swatch.style.backgroundColor = color.hex;
            swatch.title = color.name;
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                this.lumeColor = color.hex;
                this.swatchesContainer.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.section.style.setProperty('--lume-color', color.hex);
            });
            this.swatchesContainer.appendChild(swatch);
        });
    },
};

function getFormattedDateTime() {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const date = now.getDate().toString().padStart(2, ' ');
    const rawDate = `${day} ${month} ${date}`;
    const dateLine = rawDate.padStart(11, ' ').padEnd(12, ' '); 
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const rawTime = `${hours.toString().padStart(2, ' ')}:${minutes} ${ampm}`;
    const timeLine = rawTime.padStart(10, ' ').padEnd(12, ' ');
    
    return { dateLine, timeLine };
}

document.addEventListener('DOMContentLoaded', () => {
  const demoElements = document.querySelectorAll('.features-module .flip');
  const demoSlots = Array.from(demoElements).map(el => ({
    instance: new FlipSlot(el),
    speed: el.getAttribute('data-speed') || 'classic'
  }));

  const dateElements = document.querySelectorAll('#customizer-date .flip');
  const dateSlots = Array.from(dateElements).map(el => new FlipSlot(el));

  const timeElements = document.querySelectorAll('#customizer-time .flip');
  const timeSlots = Array.from(timeElements).map(el => new FlipSlot(el));

  let isDemoInView = false;

  const updateDisplay = async () => {
    const { dateLine, timeLine } = getFormattedDateTime();
    const targetDigit = Math.floor(Math.random() * 10).toString();
    
    const promises = [];

    // Only flip Demo Slots if the section is in view AND not static
    if (isDemoInView) {
        demoSlots.forEach(slot => {
            if (!slot.instance.element.classList.contains('static-tile')) {
                promises.push(slot.instance.flip(targetDigit, slot.speed));
            }
        });
    }

    // Customizer Slots remain STATIC (instant updateView)
    dateSlots.forEach((slot, i) => {
        slot.updateView(dateLine[i]);
    });

    timeSlots.forEach((slot, i) => {
        slot.updateView(timeLine[i]);
    });

    if (promises.length > 0) {
        await Promise.all(promises);
    }
  };

  const syncLoop = async () => {
      await updateDisplay();
      setTimeout(syncLoop, 2500);
  };

  // Intersection Observer for Demo Section
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          isDemoInView = entry.isIntersecting;
      });
  }, { threshold: 0.2 });

  const demoSection = document.querySelector('.features-module');
  if (demoSection) observer.observe(demoSection);

  // Showcase Interaction Logic
  const showcaseBoard = document.getElementById('showcase-board');
  const featureSelectionBar = document.querySelector('.feature-selection-bar');
  if (showcaseBoard && featureSelectionBar) {
      const showcaseSlots = Array.from(showcaseBoard.querySelectorAll('.flip')).map(el => new FlipSlot(el));
      const featureBtns = featureSelectionBar.querySelectorAll('.feature-opt');
      
      const FEATURE_DATA = {
          time: () => {
              const now = new Date();
              const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const date = now.getDate().toString().padStart(2, '0');
              
              let hours = now.getHours();
              hours = hours % 12 || 12;
              const mins = now.getMinutes().toString().padStart(2, '0');
              const timeStr = `${hours}:${mins}`;
              
              // Map to rows (6 chars each)
              const row1 = day.padEnd(6, ' ');
              const row2 = `${month} ${date}`.padEnd(6, ' ');
              const row3 = timeStr.padEnd(6, ' ');
              return row1 + row2 + row3; // First 18 slots
          },
          music: () => {
              const r1 = "YOUR  ";
              const r2 = "LATEST";
              const r3 = "TRACK ";
              return r1 + r2 + r3;
          },
          weather: () => {
              const r1 = "72 F  ";
              const r2 = "SUNNY ";
              const r3 = "DENVER";
              return r1 + r2 + r3;
          },
          messaging: () => {
              const r1 = "STAY  ";
              const r2 = "IN THE";
              const r3 = "FLOW  ";
              const r4 = "TODAY ";
              return r1 + r2 + r3 + r4;
          },
          quotes: () => {
              const r1 = "ONE   ";
              const r2 = "STEP  ";
              const r3 = "AT A  ";
              const r4 = "TIME  ";
              return r1 + r2 + r3 + r4;
          }
      };

      let currentShowcaseSession = 0;

      const updateShowcase = async (feature) => {
          const session = ++currentShowcaseSession;
          const rawText = FEATURE_DATA[feature]();
          const paddedText = rawText.toUpperCase().padEnd(24, ' ');
          
          const promises = showcaseSlots.map((slot, i) => {
              if (session !== currentShowcaseSession) return Promise.resolve();
              return slot.flip(paddedText[i], 'fast', i * 30);
          });
          
          await Promise.all(promises);
      };

      featureBtns.forEach(btn => {
          btn.addEventListener('click', () => {
              const feature = btn.getAttribute('data-feature');
              featureBtns.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              updateShowcase(feature);
          });
      });

      // Initial Load
      setTimeout(() => updateShowcase('time'), 1500);
  }
  
  setTimeout(syncLoop, 1000);
  Customizer.init();

  // Sticky Header Reveal Logic
  const header = document.querySelector('.sticky-header');
  window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
          header.classList.add('visible');
      } else {
          header.classList.remove('visible');
      }
  });
});
