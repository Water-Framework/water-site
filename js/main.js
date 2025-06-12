// Initialize syntax highlighting
document.addEventListener('DOMContentLoaded', () => {
    // Initialize syntax highlighting
    hljs.highlightAll();

    // Mobile navigation toggle
    const createMobileNav = () => {
        const nav = document.querySelector('nav');
        const mobileNavButton = document.createElement('button');
        mobileNavButton.className = 'mobile-nav-toggle';
        mobileNavButton.innerHTML = '<i class="fas fa-bars"></i>';
        
        nav.appendChild(mobileNavButton);

        mobileNavButton.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('show');
            mobileNavButton.innerHTML = navLinks.classList.contains('show') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    };

    // Add mobile navigation if screen is small
    if (window.innerWidth <= 768) {
        createMobileNav();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.mobile-nav-toggle')) {
                createMobileNav();
            }
        } else {
            const mobileNavButton = document.querySelector('.mobile-nav-toggle');
            if (mobileNavButton) {
                mobileNavButton.remove();
                document.querySelector('.nav-links').classList.remove('show');
            }
        }
    });

    // Documentation page functionality
    const docsContent = document.getElementById('docs-content');
    const docLinks = document.querySelectorAll('.docs-sidebar a[data-md]');

    if (docsContent && docLinks.length > 0) {
        // Configure marked options
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true
        });

        // Function to load and render Markdown content
        async function loadMarkdownContent(mdFile) {
            try {
                const response = await fetch(`content/${mdFile}`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${mdFile}`);
                }
                const markdown = await response.text();
                const html = marked.parse(markdown);
                docsContent.innerHTML = html;

                // Apply syntax highlighting to code blocks
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            } catch (error) {
                console.error('Error loading documentation:', error);
                docsContent.innerHTML = `<div class="error">Error loading documentation: ${error.message}</div>`;
            }
        }

        // Handle documentation navigation
        docLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active state
                docLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Load content
                const mdFile = link.getAttribute('data-md');
                loadMarkdownContent(mdFile);

                // Update URL hash
                const hash = link.getAttribute('href');
                history.pushState(null, null, hash);
            });
        });

        // Load initial content based on URL hash or default to first item
        const initialHash = window.location.hash || '#core-concepts';
        const initialLink = document.querySelector(`.docs-sidebar a[href="${initialHash}"]`);
        if (initialLink) {
            initialLink.click();
        } else {
            docLinks[0].click();
        }
    }
}); 