document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnIcon = document.querySelector('.btn-icon');
    const btnLoader = document.querySelector('.btn-loader');
    const formMessage = document.getElementById('formMessage');

    // Input validation patterns
    const patterns = {
        name: /^[a-zA-Z\s]{2,50}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        message: /^.{10,500}$/
    };

    // Error messages
    const errorMessages = {
        name: 'Please enter a valid name (2-50 characters, letters only)',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        message: 'Message must be between 10 and 500 characters'
    };

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    function validateField(field) {
        const pattern = patterns[field.id];
        const value = field.value.trim();
        
        if (pattern && !pattern.test(value)) {
            field.style.borderColor = '#dc3545';
            field.classList.add('error');
            return false;
        } else if (value === '') {
            field.style.borderColor = '#e0e0e0';
            field.classList.remove('error');
            return false;
        } else {
            field.style.borderColor = '#28a745';
            field.classList.remove('error');
            return true;
        }
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input) && input.hasAttribute('required')) {
                isValid = false;
            }
        });

        if (!isValid) {
            showMessage('Please fill all fields correctly', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);

        // Collect form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            company: document.getElementById('company').value.trim() || 'Not provided',
            message: document.getElementById('message').value.trim()
        };

        try {
            const response = await fetch('/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Show success message
                showMessage('Message sent successfully! Redirecting...', 'success');
                
                // Clear form
                form.reset();
                inputs.forEach(input => {
                    input.style.borderColor = '#e0e0e0';
                });

                // Redirect to success page
                setTimeout(() => {
                    window.location.href = '/success';
                }, 2000);
            } else {
                throw new Error(data.message || 'Error sending message');
            }
        } catch (error) {
            showMessage(error.message, 'error');
            setLoadingState(false);
        }
    });

    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            btnText.style.opacity = '0';
            btnIcon.style.opacity = '0';
            btnLoader.style.display = 'flex';
        } else {
            submitBtn.disabled = false;
            btnText.style.opacity = '1';
            btnIcon.style.opacity = '1';
            btnLoader.style.display = 'none';
        }
    }

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 5000);
    }

    // Add floating label effect
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });

        // Check initial value
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });

    // Smooth scroll to form message
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });

    observer.observe(formMessage);
});
// Initialize services carousel
$(document).ready(function(){
    $('.services-carousel').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
});