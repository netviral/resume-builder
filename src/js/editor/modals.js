/**
 * Reusable Modal Component
 */
const Modal = {
    /**
     * Shows a confirmation modal
     * @param {Object} options 
     * @param {string} options.title
     * @param {string} options.message
     * @param {Array} options.buttons - Array of { label, onClick, className }
     */
    show(options) {
        const { title, message, buttons } = options;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `<h3>${title}</h3>`;

        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `<p>${message}</p>`;

        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        buttons.forEach(btnOptions => {
            const btn = document.createElement('button');
            btn.className = `btn ${btnOptions.className || 'btn-outline'}`;
            btn.innerText = btnOptions.label;
            btn.onclick = () => {
                if (btnOptions.onClick) btnOptions.onClick();
                this.close(overlay);
            };
            footer.appendChild(btn);
        });

        // Add cancel button if not provided
        if (!buttons.some(b => b.label.toLowerCase() === 'cancel')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-ghost';
            cancelBtn.innerText = 'Cancel';
            cancelBtn.onclick = () => this.close(overlay);
            footer.appendChild(cancelBtn);
        }

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);

        // Close on escape
        const escListener = (e) => {
            if (e.key === 'Escape') {
                this.close(overlay);
                document.removeEventListener('keydown', escListener);
            }
        };
        document.addEventListener('keydown', escListener);

        return overlay;
    },

    close(overlay) {
        if (!overlay) return;
        overlay.classList.add('closing');

        // Remove after a short delay for the exit animation
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 150);
    }
};
