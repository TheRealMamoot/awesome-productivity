document.addEventListener('DOMContentLoaded', function () {
    // Wait for the command palette to be available in the DOM
    const checkElement = setInterval(() => {
        const commandDialog = document.querySelector('.quick-input-widget');

        if (commandDialog) {
            // If the palette is already visible, run the blur script
            if (commandDialog.style.display !== 'none') {
                runMyScript();
            }

            // Set up a MutationObserver to detect changes in visibility
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (commandDialog.style.display === 'none') {
                            handleEscape(); // Palette closed
                        } else {
                            runMyScript();  // Palette opened
                        }
                    }
                });
            });

            observer.observe(commandDialog, { attributes: true });

            // Stop checking once the observer is active
            clearInterval(checkElement);
        }
    }, 500);

    // Listen for keyboard shortcuts to show/hide the palette
    document.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'p') {
            event.preventDefault();
            runMyScript();
        } else if (event.key === 'Escape' || event.key === 'Esc') {
            event.preventDefault();
            handleEscape();
        }
    });

    // Also listen for Escape key in capture mode
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            handleEscape();
        }
    }, true);

    // Function to add the blur layer and dim background UI
    function runMyScript() {
        const targetDiv = document.querySelector('.monaco-workbench');

        // Remove existing blur if it exists
        const existingElement = document.getElementById('command-blur');
        if (existingElement) existingElement.remove();

        // Create and insert the blur overlay
        const newElement = document.createElement('div');
        newElement.setAttribute('id', 'command-blur');

        // Optional: remove on click
        newElement.addEventListener('click', function () {
            newElement.remove();
        });

        targetDiv.appendChild(newElement);

        // Hide sticky widgets
        const widgets = document.querySelectorAll('.sticky-widget');
        widgets.forEach(widget => widget.style.opacity = 0);

        const treeWidget = document.querySelector('.monaco-tree-sticky-container');
        if (treeWidget) treeWidget.style.opacity = 0;

        // Blur and dim UI elements except those inside the command palette
        document.querySelectorAll('.action-label, .active-item-indicator, .badge-content').forEach(el => {
            if (!el.closest('.quick-input-widget')) {
                el.style.filter = 'blur(2px)';
                el.style.opacity = '0.5';
            }
        });
    }

    // Function to remove blur and restore UI state
    function handleEscape() {
        const element = document.getElementById('command-blur');
        if (element) element.click();

        // Restore widget visibility
        const widgets = document.querySelectorAll('.sticky-widget');
        widgets.forEach(widget => widget.style.opacity = 1);

        const treeWidget = document.querySelector('.monaco-tree-sticky-container');
        if (treeWidget) treeWidget.style.opacity = 1;

        // Reset filters and opacity
        document.querySelectorAll('.action-label, .active-item-indicator, .badge-content').forEach(el => {
            el.style.filter = '';
            el.style.opacity = '';
        });
    }
});