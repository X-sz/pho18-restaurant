// ==========================================
// Navigation Scroll Effect
// ==========================================

const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ==========================================
// Smooth Scroll for Navigation Links
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// PDF.js Setup and Rendering
// ==========================================

const pdfUrl = 'menu/menu.pdf';
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');
const pageNumDisplay = document.getElementById('pageNum');
const pageCountDisplay = document.getElementById('pageCount');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const zoomLevelDisplay = document.getElementById('zoomLevel');
const pdfFallback = document.getElementById('pdfFallback');
const pdfViewer = document.getElementById('pdfViewer');

// Check if PDF.js is loaded
if (typeof pdfjsLib !== 'undefined') {
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    /**
     * Render the page
     */
    function renderPage(num) {
        pageRendering = true;
        
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            }).catch(error => {
                console.error('Error rendering page:', error);
                pageRendering = false;
            });
        }).catch(error => {
            console.error('Error getting page:', error);
            pageRendering = false;
        });

        // Update page counters
        pageNumDisplay.textContent = num;
    }

    /**
     * Queue page rendering
     */
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    /**
     * Show previous page
     */
    function onPrevPage() {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
        updateButtons();
    }

    /**
     * Show next page
     */
    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
        updateButtons();
    }

    /**
     * Update button states
     */
    function updateButtons() {
        prevButton.disabled = pageNum <= 1;
        nextButton.disabled = pageNum >= pdfDoc.numPages;
    }

    /**
     * Zoom in
     */
    function zoomIn() {
        if (scale < 3) {
            scale += 0.25;
            queueRenderPage(pageNum);
            updateZoomDisplay();
        }
    }

    /**
     * Zoom out
     */
    function zoomOut() {
        if (scale > 0.5) {
            scale -= 0.25;
            queueRenderPage(pageNum);
            updateZoomDisplay();
        }
    }

    /**
     * Update zoom level display
     */
    function updateZoomDisplay() {
        zoomLevelDisplay.textContent = Math.round(scale * 100) + '%';
    }

    /**
     * Load the PDF document
     */
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    
    loadingTask.promise.then(pdf => {
        pdfDoc = pdf;
        pageCountDisplay.textContent = pdf.numPages;

        // Initial page render
        renderPage(pageNum);
        updateButtons();
        updateZoomDisplay();

        // Event listeners
        prevButton.addEventListener('click', onPrevPage);
        nextButton.addEventListener('click', onNextPage);
        zoomInButton.addEventListener('click', zoomIn);
        zoomOutButton.addEventListener('click', zoomOut);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                onPrevPage();
            } else if (e.key === 'ArrowRight') {
                onNextPage();
            } else if (e.key === '+' || e.key === '=') {
                zoomIn();
            } else if (e.key === '-') {
                zoomOut();
            }
        });

    }).catch(error => {
        console.error('Error loading PDF:', error);
        showFallback();
    });

} else {
    // PDF.js not loaded, show fallback
    console.error('PDF.js library not loaded');
    showFallback();
}

/**
 * Show fallback UI when PDF cannot be loaded
 */
function showFallback() {
    const canvasWrapper = document.querySelector('.pdf-canvas-wrapper');
    const controls = document.querySelector('.pdf-controls');
    const zoomControls = document.querySelector('.pdf-zoom-controls');
    
    if (canvasWrapper) canvasWrapper.style.display = 'none';
    if (controls) controls.style.display = 'none';
    if (zoomControls) zoomControls.style.display = 'none';
    if (pdfFallback) pdfFallback.style.display = 'block';
}

// ==========================================
// Current Year for Footer
// ==========================================

document.getElementById('currentYear').textContent = new Date().getFullYear();

// ==========================================
// Responsive handling for touch devices
// ==========================================

let touchStartX = 0;
let touchEndX = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        // Swipe left - next page
        onNextPage();
    }
    if (touchEndX > touchStartX + 50) {
        // Swipe right - previous page
        onPrevPage();
    }
}
```

---

## 部署说明

### 文件结构
创建以下目录结构:
```
/*your-repo/
├── index.html
├── assets/
│   ├── style.css
│   └── script.js
└── menu/
    └── menu.pdf
*/