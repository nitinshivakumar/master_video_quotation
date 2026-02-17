// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateGrandTotal();
    animateStats();
    initializeScrollEffects();
}

// Animate hero statistics
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        animateValue(stat, 0, target, 2000);
    });
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end + (end > 100 ? '+' : '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (end > 100 ? '+' : '');
        }
    }, 16);
}

// Scroll effects
function initializeScrollEffects() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Update quantity
function updateQuantity(serviceId, change) {
    const serviceItem = document.querySelector(`[data-id="${serviceId}"]`);
    const quantityInput = serviceItem.querySelector('.qty-input');
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(0, currentValue + change);
    
    quantityInput.value = newValue;
    
    // Add/remove selected class
    if (newValue > 0) {
        serviceItem.classList.add('selected');
        // Pulse animation
        serviceItem.style.transform = 'scale(1.02)';
        setTimeout(() => {
            serviceItem.style.transform = '';
        }, 200);
    } else {
        serviceItem.classList.remove('selected');
    }
    
    updateServiceTotal(serviceItem);
    updateGrandTotal();
    updateProgress();
}

// Update service total
function updateServiceTotal(serviceItem) {
    const price = parseInt(serviceItem.dataset.price);
    const quantity = parseInt(serviceItem.querySelector('.qty-input').value);
    const total = price * quantity;
    const totalElement = serviceItem.querySelector('.item-total');
    
    totalElement.textContent = total > 0 ? `₹${total.toLocaleString('en-IN')}` : '₹0';
}

// Update grand total
function updateGrandTotal() {
    let grandTotal = 0;
    let totalSessions = 0;
    let selectedServices = 0;
    
    document.querySelectorAll('.service-item-modern').forEach(item => {
        const price = parseInt(item.dataset.price);
        const quantity = parseInt(item.querySelector('.qty-input').value);
        grandTotal += price * quantity;
        totalSessions += quantity;
        if (quantity > 0) selectedServices++;
    });
    
    // Update floating summary
    document.getElementById('total-amount-float').textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    document.getElementById('total-sessions-float').textContent = totalSessions;
    document.getElementById('selected-count').textContent = 
        `${selectedServices} service${selectedServices !== 1 ? 's' : ''} selected`;
}

// Update progress bar
function updateProgress() {
    const totalServices = 9;
    let selectedServices = 0;
    
    document.querySelectorAll('.service-item-modern').forEach(item => {
        const quantity = parseInt(item.querySelector('.qty-input').value);
        if (quantity > 0) selectedServices++;
    });
    
    const percentage = (selectedServices / totalServices) * 100;
    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-percentage').textContent = Math.round(percentage) + '%';
}

// Toggle summary
function toggleSummary() {
    const summary = document.getElementById('summary-float');
    summary.classList.toggle('minimized');
}

// Reset quotation
function resetQuotation() {
    if (confirm('Are you sure you want to reset all selections?')) {
        document.querySelectorAll('.qty-input').forEach(input => {
            input.value = 0;
        });
        
        document.querySelectorAll('.service-item-modern').forEach(item => {
            item.classList.remove('selected');
            updateServiceTotal(item);
        });
        
        updateGrandTotal();
        updateProgress();
        showNotification('All selections have been reset!', 'info');
    }
}

// Load image as base64
function loadImageAsBase64(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // White background so black logo lines show clearly
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw image
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = src;
    });
}

// Helper: format price without rupee symbol (jsPDF can't render ₹)
function fmt(amount) {
    return 'Rs. ' + Number(amount).toLocaleString('en-IN');
}

// Download PDF quotation
async function downloadPDFQuotation() {
    const totalSessionsEl = document.getElementById('total-sessions-float');
    const totalAmountEl   = document.getElementById('total-amount-float');
    const totalSessions   = parseInt(totalSessionsEl.textContent) || 0;

    if (totalSessions === 0) {
        showNotification('Please select at least one service to generate a quotation.', 'warning');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        // ── Brand colours ──────────────────────────────────────────
        const cPrimary      = [61,  90,  107];
        const cBlue         = [43,  159, 216];
        const cTurquoise    = [78,  201, 201];
        const cDark         = [44,  62,  80];
        const cLight        = [108, 117, 125];
        const cWhite        = [255, 255, 255];

        let y = 15;

        // ── Logo ────────────────────────────────────────────────────
        try {
            const logoData = await loadImageAsBase64('logo.png');
            // white box behind logo
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(70, y, 70, 30, 4, 4, 'F');
            doc.addImage(logoData, 'PNG', 72, y + 1, 66, 28);
            y += 36;
        } catch (e) {
            y += 5;
        }

        // ── Divider + Title ─────────────────────────────────────────
        doc.setDrawColor(...cBlue);
        doc.setLineWidth(0.8);
        doc.line(20, y, 190, y);
        y += 8;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...cBlue);
        doc.text('QUOTATION', 105, y, { align: 'center' });
        y += 8;

        // Date
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...cLight);
        doc.text('Date: ' + dateStr, 105, y, { align: 'center' });
        y += 12;

        // ── Business Details box ────────────────────────────────────
        doc.setFillColor(244, 247, 250);
        doc.setDrawColor(...cTurquoise);
        doc.setLineWidth(0.5);
        doc.roundedRect(20, y, 170, 28, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...cPrimary);
        doc.text('BUSINESS DETAILS', 25, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...cDark);
        doc.text('Contact : Shivakumar G  |  Ph: 9845452391', 25, y + 13);
        doc.text('Address : Vijaynagar, Bengaluru, KA - 560079', 25, y + 19);
        doc.setTextColor(...cBlue);
        doc.text('Instagram: instagram.com/mastervideo_shivu', 25, y + 25);
        doc.setTextColor(24, 119, 242);
        doc.text('Facebook : facebook.com/share/1E1Fz95WQG', 110, y + 25);
        y += 36;

        // ── Selected Services header ────────────────────────────────
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...cPrimary);
        doc.text('SELECTED SERVICES', 20, y);
        y += 4;
        doc.setDrawColor(...cBlue);
        doc.setLineWidth(0.4);
        doc.line(20, y, 190, y);
        y += 8;

        // ── Collect services ────────────────────────────────────────
        const categories = {
            'Photography Services': [],
            'Videography Services': [],
            'Premium Add-ons': []
        };

        document.querySelectorAll('.service-item-modern').forEach(item => {
            const qty = parseInt(item.querySelector('.qty-input').value);
            if (qty > 0) {
                const name  = item.querySelector('h4').textContent.trim();
                const price = parseInt(item.dataset.price);
                const total = price * qty;
                const nl    = name.toLowerCase();
                let cat = 'Premium Add-ons';
                if (nl.includes('photo')) cat = 'Photography Services';
                else if (nl.includes('video') || nl.includes('mixing')) cat = 'Videography Services';
                categories[cat].push({ name, qty, price, total });
            }
        });

        // ── Render each category ────────────────────────────────────
        Object.entries(categories).forEach(([cat, services]) => {
            if (!services.length) return;

            if (y > 240) { doc.addPage(); y = 20; }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...cBlue);
            doc.text(cat, 20, y);
            y += 6;

            services.forEach(s => {
                if (y > 265) { doc.addPage(); y = 20; }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...cDark);
                doc.text(s.name, 26, y);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...cLight);
                y += 5;
                doc.text(s.qty + ' session(s)  x  ' + fmt(s.price) + '  =  ' + fmt(s.total), 30, y);
                y += 7;
            });
            y += 3;
        });

        // ── Summary box ─────────────────────────────────────────────
        if (y > 220) { doc.addPage(); y = 20; }

        const rawTotal = totalAmountEl.textContent.replace(/[^\d]/g, '');
        const fmtTotal = fmt(rawTotal);

        doc.setFillColor(...cBlue);
        doc.setDrawColor(...cTurquoise);
        doc.roundedRect(20, y, 170, 28, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...cWhite);
        doc.text('QUOTATION SUMMARY', 25, y + 8);

        doc.setFontSize(10);
        doc.text('Total Sessions : ' + totalSessions, 25, y + 16);

        doc.setFontSize(14);
        doc.text('TOTAL AMOUNT : ' + fmtTotal, 25, y + 24);
        y += 36;

        // ── Album Pricing ───────────────────────────────────────────
        if (y > 250) { doc.addPage(); y = 20; }

        doc.setFillColor(255, 249, 219);
        doc.setDrawColor(245, 158, 11);
        doc.roundedRect(20, y, 170, 18, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(133, 100, 4);
        doc.text('ALBUM PRICING', 25, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Rs. 300 per sheet (12x30 or 12x36 inches)   |   Rs. 1,500 per pad', 25, y + 13);
        y += 26;

        // ── Notes ───────────────────────────────────────────────────
        if (y > 250) { doc.addPage(); y = 20; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...cDark);
        doc.text('NOTES:', 20, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...cLight);
        [
            'All prices are in Indian Rupees (INR).',
            'Coverage is based on each session.',
            'This quotation is valid for 30 days.',
            'Final pricing may vary based on specific requirements.'
        ].forEach(note => {
            doc.text('• ' + note, 22, y);
            y += 5;
        });

        // ── PDF Footer (fixed at bottom of last page) ───────────────
        const pageH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(...cBlue);
        doc.setLineWidth(0.4);
        doc.line(20, pageH - 22, 190, pageH - 22);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...cPrimary);
        doc.text('Master Video Photography', 105, pageH - 16, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...cLight);
        doc.text('Vijaynagar, Bengaluru, KA-560079  |  9845452391', 105, pageH - 11, { align: 'center' });

        doc.setTextColor(...cBlue);
        doc.textWithLink('instagram.com/mastervideo_shivu', 52, pageH - 6, { url: 'https://www.instagram.com/mastervideo_shivu' });
        doc.setTextColor(...cLight);
        doc.text('  |  ', 101, pageH - 6);
        doc.setTextColor(24, 119, 242);
        doc.textWithLink('facebook.com/share/1E1Fz95WQG', 112, pageH - 6, { url: 'https://www.facebook.com/share/1E1Fz95WQG' });

        // ── Save ────────────────────────────────────────────────────
        const ts = new Date().toISOString().split('T')[0];
        doc.save('MasterVideo_Quotation_' + ts + '.pdf');
        showNotification('PDF quotation downloaded successfully!', 'success');

    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '600',
        fontSize: '0.875rem',
        zIndex: '10000',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 0.3s ease-out',
        fontFamily: 'Barlow, sans-serif',
        maxWidth: '400px'
    });
    
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        info: '#2b9fd8',
        error: '#ef4444'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
