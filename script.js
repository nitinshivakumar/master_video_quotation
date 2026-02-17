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
        summaryCard.style.borderColor = '#667eea';
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
 * Download the quotation as a text file
 */
function downloadQuotation() {
    const totalAmount = document.getElementById('total-amount').textContent;
    const totalSessions = document.getElementById('total-sessions').textContent;
    
    if (parseInt(totalSessions) === 0) {
        showNotification('Please select at least one service to generate a quotation.', 'warning');
        return;
    }
    
    // Build quotation text
    let quotationText = generateQuotationText(totalAmount, totalSessions);
    
    // Create and download file
    const blob = new Blob([quotationText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `Master_Video_Photography_Quotation_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Quotation downloaded successfully!', 'success');
}

/**
 * Generate quotation text content
 * @param {string} totalAmount - The total amount string
 * @param {string} totalSessions - The total sessions string
 * @returns {string} The formatted quotation text
 */
function generateQuotationText(totalAmount, totalSessions) {
    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    let quotationText = '';
    quotationText += '═══════════════════════════════════════════════════════\n';
    quotationText += '           MASTER VIDEO PHOTOGRAPHY\n';
    quotationText += '                  QUOTATION\n';
    quotationText += '═══════════════════════════════════════════════════════\n\n';
    quotationText += `Date: ${currentDate}\n\n`;
    quotationText += 'BUSINESS DETAILS:\n';
    quotationText += '───────────────────────────────────────────────────────\n';
    quotationText += 'Contact Person: Shivakumar G\n';
    quotationText += 'Phone: 9845452391\n';
    quotationText += 'Location: Bengaluru - 560079\n\n';
    quotationText += 'SELECTED SERVICES:\n';
    quotationText += '═══════════════════════════════════════════════════════\n\n';
    
    // Group services by category
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
            quotationText += `${category}:\n`;
            quotationText += '───────────────────────────────────────────────────────\n';
            categories[category].forEach(service => {
                quotationText += `\n${service.name}\n`;
                quotationText += `  Sessions: ${service.quantity} × ₹${service.price.toLocaleString('en-IN')}\n`;
                quotationText += `  Subtotal: ₹${service.total.toLocaleString('en-IN')}\n`;
            });
            quotationText += '\n';
        }
    });
    
    quotationText += '═══════════════════════════════════════════════════════\n';
    quotationText += 'QUOTATION SUMMARY:\n';
    quotationText += '───────────────────────────────────────────────────────\n';
    quotationText += `Total Sessions Selected: ${totalSessions}\n`;
    quotationText += `TOTAL AMOUNT: ${totalAmount}\n`;
    quotationText += '═══════════════════════════════════════════════════════\n\n';
    
    quotationText += 'ALBUM PRICING:\n';
    quotationText += '───────────────────────────────────────────────────────\n';
    quotationText += '• ₹300 per sheet (Size: 12 x 30 or 12 x 36 inches)\n';
    quotationText += '• ₹1,500 per pad\n\n';
    
    quotationText += 'IMPORTANT NOTES:\n';
    quotationText += '───────────────────────────────────────────────────────\n';
    quotationText += '• All prices are in Indian Rupees (INR)\n';
    quotationText += '• The item coverage above is based on each session\n';
    quotationText += '• This quotation is valid for 30 days from the date above\n';
    quotationText += '• Final pricing may vary based on specific requirements\n';
    quotationText += '• Please contact us for any customizations or queries\n\n';
    
    quotationText += '═══════════════════════════════════════════════════════\n';
    quotationText += 'Thank you for considering Master Video Photography!\n';
    quotationText += 'We look forward to capturing your special moments.\n';
    quotationText += '═══════════════════════════════════════════════════════\n';
    
    return quotationText;
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
        maxWidth: '400px'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        warning: '#ffc107',
        info: '#667eea',
        error: '#dc3545'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
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