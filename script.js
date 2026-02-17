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
            
            // Fill white background
            ctx.fillStyle = '#3d5a6b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw image
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = src;
    });
}

// Download PDF quotation
async function downloadPDFQuotation() {
    const totalSessions = document.getElementById('total-sessions-float').textContent;
    
    if (parseInt(totalSessions) === 0) {
        showNotification('Please select at least one service to generate a quotation.', 'warning');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Brand colors
        const primary = [61, 90, 107];
        const accentBlue = [43, 159, 216];
        const accentTurquoise = [78, 201, 201];
        const textDark = [44, 62, 80];
        const textLight = [108, 117, 125];
        
        let y = 20;
        
        // Load and add logo
        try {
            const logoImg = await loadImageAsBase64('logo.png');
            doc.addImage(logoImg, 'PNG', 75, y, 60, 25);
            y += 30;
        } catch (e) {
            y += 5;
        }
        
        // Header line
        doc.setDrawColor(...accentBlue);
        doc.setLineWidth(1);
        doc.line(20, y, 190, y);
        y += 10;
        
        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentBlue);
        doc.text('QUOTATION', 105, y, { align: 'center' });
        y += 15;
        
        // Date
        const date = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textLight);
        doc.text(`Date: ${date}`, 105, y, { align: 'center' });
        y += 15;
        
        // Business details box
        doc.setDrawColor(...accentTurquoise);
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(20, y, 170, 25, 3, 3, 'FD');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textDark);
        doc.text('BUSINESS DETAILS', 25, y + 7);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Contact Person: Shivakumar G', 25, y + 13);
        doc.text('Phone: 9845452391', 25, y + 18);
        doc.text('Location: Bengaluru - 560079', 25, y + 23);
        y += 35;
        
        // Services header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primary);
        doc.text('SELECTED SERVICES', 20, y);
        y += 8;
        
        doc.setDrawColor(...accentBlue);
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 10;
        
        // Collect services
        const categories = {
            'Photography Services': [],
            'Videography Services': [],
            'Premium Add-ons': []
        };
        
        document.querySelectorAll('.service-item-modern').forEach(item => {
            const quantity = parseInt(item.querySelector('.qty-input').value);
            if (quantity > 0) {
                const name = item.querySelector('h4').textContent;
                const price = parseInt(item.dataset.price);
                const total = price * quantity;
                
                let category = 'Premium Add-ons';
                if (name.toLowerCase().includes('photo')) {
                    category = 'Photography Services';
                } else if (name.toLowerCase().includes('video') || name.toLowerCase().includes('mixing')) {
                    category = 'Videography Services';
                }
                
                categories[category].push({ name, quantity, price, total });
            }
        });
        
        // Add services by category
        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...accentBlue);
                doc.text(category, 20, y);
                y += 7;
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...textDark);
                
                categories[category].forEach(service => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text(service.name, 25, y);
                    y += 5;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...textLight);
                    doc.text(`Sessions: ${service.quantity} × ₹${service.price.toLocaleString('en-IN')}`, 30, y);
                    doc.text(`Subtotal: ₹${service.total.toLocaleString('en-IN')}`, 120, y);
                    y += 8;
                    
                    doc.setTextColor(...textDark);
                });
                
                y += 5;
            }
        });
        
        // Summary box
        if (y > 230) {
            doc.addPage();
            y = 20;
        }
        
        const totalAmount = document.getElementById('total-amount-float').textContent;
        
        doc.setDrawColor(...accentTurquoise);
        doc.setFillColor(...accentBlue);
        doc.roundedRect(20, y, 170, 30, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('QUOTATION SUMMARY', 25, y + 8);
        
        doc.setFontSize(11);
        doc.text(`Total Sessions: ${totalSessions}`, 25, y + 16);
        
        doc.setFontSize(16);
        doc.text(`TOTAL AMOUNT: ${totalAmount}`, 25, y + 25);
        y += 40;
        
        // Album pricing
        doc.setDrawColor(...textLight);
        doc.setFillColor(255, 243, 205);
        doc.roundedRect(20, y, 170, 20, 3, 3, 'FD');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(133, 100, 4);
        doc.text('ALBUM PRICING', 25, y + 7);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('• ₹300 per sheet (Size: 12 x 30 or 12 x 36 inches)', 25, y + 12);
        doc.text('• ₹1,500 per pad', 25, y + 17);
        y += 30;
        
        // Notes
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textDark);
        doc.text('IMPORTANT NOTES:', 20, y);
        y += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textLight);
        
        const notes = [
            '• All prices are in Indian Rupees (INR)',
            '• The item coverage above is based on each session',
            '• This quotation is valid for 30 days from the date above',
            '• Final pricing may vary based on specific requirements',
            '• Please contact us for any customizations or queries'
        ];
        
        notes.forEach(note => {
            doc.text(note, 20, y);
            y += 5;
        });
        
        // Footer
        y = 280;
        doc.setDrawColor(...accentBlue);
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textLight);
        doc.text('Thank you for considering Master Video Photography!', 105, y, { align: 'center' });
        y += 5;
        doc.text('We look forward to capturing your special moments.', 105, y, { align: 'center' });
        
        // Save
        const timestamp = new Date().toISOString().split('T')[0];
        doc.save(`Master_Video_Photography_Quotation_${timestamp}.pdf`);
        
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
