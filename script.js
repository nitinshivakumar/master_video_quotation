// Initialize totals on page load
document.addEventListener('DOMContentLoaded', function() {
    updateGrandTotal();
});

/**
 * Update quantity for a service
 * @param {string} serviceId - The unique identifier for the service
 * @param {number} change - The amount to change (+1 or -1)
 */
function updateQuantity(serviceId, change) {
    const serviceItem = document.querySelector(`[data-id="${serviceId}"]`);
    const quantityInput = serviceItem.querySelector('.quantity-input');
    const currentValue = parseInt(quantityInput.value);
    const newValue = Math.max(0, currentValue + change);
    
    quantityInput.value = newValue;
    updateServiceTotal(serviceItem);
    updateGrandTotal();
    
    // Add animation effect
    if (change > 0) {
        serviceItem.style.transform = 'scale(1.02)';
        setTimeout(() => {
            serviceItem.style.transform = '';
        }, 200);
    }
}

/**
 * Update the total price for a single service
 * @param {HTMLElement} serviceItem - The service item element
 */
function updateServiceTotal(serviceItem) {
    const price = parseInt(serviceItem.dataset.price);
    const quantity = parseInt(serviceItem.querySelector('.quantity-input').value);
    const total = price * quantity;
    const totalElement = serviceItem.querySelector('.service-total');
    
    if (quantity > 0) {
        totalElement.textContent = `₹ ${total.toLocaleString('en-IN')}`;
        totalElement.style.color = '#28a745';
    } else {
        totalElement.textContent = '₹ 0';
        totalElement.style.color = '#6c757d';
    }
}

/**
 * Update the grand total and total sessions
 */
function updateGrandTotal() {
    let grandTotal = 0;
    let totalSessions = 0;
    
    document.querySelectorAll('.service-item').forEach(item => {
        const price = parseInt(item.dataset.price);
        const quantity = parseInt(item.querySelector('.quantity-input').value);
        grandTotal += price * quantity;
        totalSessions += quantity;
    });
    
    // Update display
    document.getElementById('total-amount').textContent = `₹ ${grandTotal.toLocaleString('en-IN')}`;
    document.getElementById('total-sessions').textContent = totalSessions;
    
    // Change color based on whether items are selected
    const summaryCard = document.querySelector('.summary-card');
    if (totalSessions > 0) {
        summaryCard.style.borderColor = '#28a745';
    } else {
        summaryCard.style.borderColor = '#2b9fd8';
    }
}

/**
 * Reset all quantities to zero
 */
function resetQuotation() {
    const confirmation = confirm('Are you sure you want to reset all selections?');
    
    if (confirmation) {
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.value = 0;
        });
        
        document.querySelectorAll('.service-item').forEach(item => {
            updateServiceTotal(item);
        });
        
        updateGrandTotal();
        
        // Show success message
        showNotification('All selections have been reset!', 'info');
    }
}

/**
 * Download the quotation as a PDF file with branding
 */
async function downloadPDFQuotation() {
    const totalAmount = document.getElementById('total-amount').textContent;
    const totalSessions = document.getElementById('total-sessions').textContent;
    
    if (parseInt(totalSessions) === 0) {
        showNotification('Please select at least one service to generate a quotation.', 'warning');
        return;
    }
    
    try {
        // Get jsPDF from window
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Brand colors
        const primaryColor = [61, 90, 107];      // #3d5a6b
        const accentBlue = [43, 159, 216];       // #2b9fd8
        const accentTurquoise = [78, 201, 201];  // #4ec9c9
        const textDark = [44, 62, 80];           // #2c3e50
        const textLight = [108, 117, 125];       // #6c757d
        
        let yPos = 20;
        
        // Add logo (as text since we can't easily embed image in jsPDF without base64)
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Master Video', 105, yPos, { align: 'center' });
        yPos += 8;
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('PHOTOGRAPHY', 105, yPos, { align: 'center' });
        yPos += 15;
        
        // Header line
        doc.setDrawColor(...accentBlue);
        doc.setLineWidth(1);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentBlue);
        doc.text('QUOTATION', 105, yPos, { align: 'center' });
        yPos += 15;
        
        // Date
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textLight);
        doc.text(`Date: ${currentDate}`, 105, yPos, { align: 'center' });
        yPos += 15;
        
        // Business Details Box
        doc.setDrawColor(...accentTurquoise);
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(20, yPos, 170, 25, 3, 3, 'FD');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textDark);
        doc.text('BUSINESS DETAILS', 25, yPos + 7);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Contact Person: Shivakumar G', 25, yPos + 13);
        doc.text('Phone: 9845452391', 25, yPos + 18);
        doc.text('Location: Bengaluru - 560079', 25, yPos + 23);
        yPos += 35;
        
        // Services Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('SELECTED SERVICES', 20, yPos);
        yPos += 8;
        
        // Line under header
        doc.setDrawColor(...accentBlue);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Collect services by category
        const categories = {
            'Photography Services': [],
            'Videography Services': [],
            'Additional Services': []
        };
        
        document.querySelectorAll('.service-item').forEach(item => {
            const quantity = parseInt(item.querySelector('.quantity-input').value);
            if (quantity > 0) {
                const name = item.querySelector('.service-name').textContent;
                const price = parseInt(item.dataset.price);
                const total = price * quantity;
                
                let category = 'Additional Services';
                if (name.includes('Photography') || name.includes('Photo')) {
                    category = 'Photography Services';
                } else if (name.includes('Video') || name.includes('Mixing')) {
                    category = 'Videography Services';
                }
                
                categories[category].push({
                    name: name,
                    quantity: quantity,
                    price: price,
                    total: total
                });
            }
        });
        
        // Add services by category
        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                // Check if we need a new page
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                // Category title
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...accentBlue);
                doc.text(category, 20, yPos);
                yPos += 7;
                
                // Services in category
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...textDark);
                
                categories[category].forEach(service => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setFont('helvetica', 'bold');
                    doc.text(service.name, 25, yPos);
                    yPos += 5;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...textLight);
                    doc.text(`Sessions: ${service.quantity} × ₹${service.price.toLocaleString('en-IN')}`, 30, yPos);
                    doc.text(`Subtotal: ₹${service.total.toLocaleString('en-IN')}`, 120, yPos);
                    yPos += 8;
                    
                    doc.setTextColor(...textDark);
                });
                
                yPos += 5;
            }
        });
        
        // Summary Box
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setDrawColor(...accentTurquoise);
        doc.setFillColor(...accentBlue);
        doc.roundedRect(20, yPos, 170, 30, 3, 3, 'FD');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('QUOTATION SUMMARY', 25, yPos + 8);
        
        doc.setFontSize(11);
        doc.text(`Total Sessions: ${totalSessions}`, 25, yPos + 16);
        
        doc.setFontSize(16);
        doc.text(`TOTAL AMOUNT: ${totalAmount}`, 25, yPos + 25);
        yPos += 40;
        
        // Album Pricing
        doc.setDrawColor(...textLight);
        doc.setFillColor(255, 243, 205);
        doc.roundedRect(20, yPos, 170, 20, 3, 3, 'FD');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(133, 100, 4);
        doc.text('ALBUM PRICING', 25, yPos + 7);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('• ₹300 per sheet (Size: 12 x 30 or 12 x 36 inches)', 25, yPos + 12);
        doc.text('• ₹1,500 per pad', 25, yPos + 17);
        yPos += 30;
        
        // Important Notes
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textDark);
        doc.text('IMPORTANT NOTES:', 20, yPos);
        yPos += 6;
        
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
            doc.text(note, 20, yPos);
            yPos += 5;
        });
        
        // Footer
        yPos = 280;
        doc.setDrawColor(...accentBlue);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textLight);
        doc.text('Thank you for considering Master Video Photography!', 105, yPos, { align: 'center' });
        yPos += 5;
        doc.text('We look forward to capturing your special moments.', 105, yPos, { align: 'center' });
        
        // Save PDF
        const timestamp = new Date().toISOString().split('T')[0];
        doc.save(`Master_Video_Photography_Quotation_${timestamp}.pdf`);
        
        showNotification('PDF quotation downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, warning, info, error)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        fontSize: '16px',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '400px',
        fontFamily: 'Barlow, sans-serif'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        warning: '#ffc107',
        info: '#2b9fd8',
        error: '#dc3545'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
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

// Smooth scroll behavior for navigation
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