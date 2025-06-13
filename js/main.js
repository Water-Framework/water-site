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
                console.log('=== loadMarkdownContent START ===');
                console.log('Loading markdown file:', mdFile);
                
                const docsContent = document.getElementById('docs-content');
                docsContent.innerHTML = '<div class="loading">Loading content...</div>';
                
                const response = await fetch(`content/${mdFile}`);
                console.log('Fetch response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
                }
                const text = await response.text();
                console.log('Content received:', text.substring(0, 200) + '...');
                if (!text) {
                    throw new Error('Received empty content');
                }
                // Use the display function to show the content
                displayMarkdownContent(text);
            } catch (error) {
                console.error('Error in loadMarkdownContent:', error);
                const docsContent = document.getElementById('docs-content');
                docsContent.innerHTML = `<div class="error">
                    Failed to load content: ${error.message}<br>
                    File: ${mdFile}
                </div>`;
            }
            console.log('=== loadMarkdownContent END ===');
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

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initializeDocumentation();
});

// Main initialization function
function initializeDocumentation() {
    console.log('Initializing documentation...');
    
    // Get all submenu links
    const subMenuLinks = document.querySelectorAll('.docs-sidebar nav ul li .sub-menu a');
    console.log('Found submenu links:', subMenuLinks.length);
    
    // Add click handler to each submenu link
    subMenuLinks.forEach(link => {
        console.log('Adding click handler to:', link.textContent);
        
        // Remove any existing click handlers
        link.replaceWith(link.cloneNode(true));
        
        // Get the fresh reference after cloning
        const freshLink = document.querySelector(`.sub-menu a[href="${link.getAttribute('href')}"]`);
        
        // Add the click handler
        freshLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Direct click on:', this.textContent);
            console.log('Remote MD:', this.getAttribute('remote-md'));
            
            // Load remote markdown content
            loadRemoteMarkdownContent(this);
            
            // Keep only the current submenu open
            const currentSubmenu = this.closest('.sub-menu');
            const parentLi = currentSubmenu.parentElement;
            parentLi.classList.add('show-submenu');
        });
    });

    // Add click handlers to top menu items
    const topMenuLinks = document.querySelectorAll('.docs-sidebar nav ul > li > a');
    console.log('Found top menu links:', topMenuLinks.length);
    
    topMenuLinks.forEach(link => {
        console.log('Adding click handler to top menu:', link.textContent);
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Top menu click on:', this.textContent);
            
            // If it has data-md attribute, load local content
            if (this.hasAttribute('data-md')) {
                console.log('Data MD:', this.getAttribute('data-md'));
                loadMarkdownContent(this.getAttribute('data-md'));
            }
            
            // Handle submenu visibility
            const parentLi = this.parentElement;
            const subMenu = parentLi.querySelector('.sub-menu');
            
            if (subMenu) {
                console.log('Found submenu for:', this.textContent);
                // Close only sibling submenus at the same level
                const siblings = Array.from(parentLi.parentElement.children);
                siblings.forEach(sibling => {
                    if (sibling !== parentLi && sibling.querySelector('.sub-menu')) {
                        sibling.classList.remove('show-submenu');
                    }
                });
                
                // Toggle show-submenu class on current item
                parentLi.classList.toggle('show-submenu');
                console.log('Submenu visibility toggled:', parentLi.classList.contains('show-submenu'));
            } else {
                console.log('No submenu found for:', this.textContent);
                // If clicked on a non-submenu item, close only sibling submenus
                const siblings = Array.from(parentLi.parentElement.children);
                siblings.forEach(sibling => {
                    if (sibling !== parentLi && sibling.querySelector('.sub-menu')) {
                        sibling.classList.remove('show-submenu');
                    }
                });
            }
        });
    });

    // Add click handler to document to close submenus when clicking outside
    document.addEventListener('click', function(e) {
        // Check if the click is outside the docs-sidebar
        if (!e.target.closest('.docs-sidebar')) {
            console.log('Click outside sidebar, closing all submenus');
            document.querySelectorAll('.docs-sidebar nav ul > li').forEach(item => {
                item.classList.remove('show-submenu');
            });
        }
    });
}

// Function to display markdown content in the docs-content element
function displayMarkdownContent(content) {
    try {
        console.log('=== displayMarkdownContent START ===');
        
        // Get the docs content container
        const docsContent = document.getElementById('docs-content');
        
        // Parse the markdown content
        const html = marked.parse(content);
        console.log('Parsed HTML:', html.substring(0, 200) + '...');
        
        // Create the markdown content container
        const markdownContent = document.createElement('div');
        markdownContent.className = 'markdown-content';
        markdownContent.innerHTML = html;
        
        // Clear existing content and add the new content
        docsContent.innerHTML = '';
        docsContent.appendChild(markdownContent);
        
        // Highlight code blocks
        highlightCodeBlocks(markdownContent);
        
        // Scroll to the content
        markdownContent.scrollIntoView({ behavior: 'smooth' });
        
        console.log('=== displayMarkdownContent END ===');
    } catch (error) {
        console.error('Error in displayMarkdownContent:', error);
        const docsContent = document.getElementById('docs-content');
        docsContent.innerHTML = `<div class="error">
            Failed to display content: ${error.message}
        </div>`;
    }
}

// Function to load remote markdown content
async function loadRemoteMarkdownContent(element) {
    try {
        console.log('=== loadRemoteMarkdownContent START ===');
        const contentUrl = element.getAttribute('remote-md');
        console.log('Loading remote content from:', contentUrl);
        
        const docsContent = document.getElementById('docs-content');
        docsContent.innerHTML = '<div class="loading">Loading content...</div>';
        
        const response = await fetch(contentUrl);
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Content received:', text.substring(0, 200) + '...');
        if (!text) {
            throw new Error('Received empty content');
        }
        // Use the display function to show the content
        displayMarkdownContent(text);
    } catch (error) {
        console.error('Error in loadRemoteMarkdownContent:', error);
        const docsContent = document.getElementById('docs-content');
        docsContent.innerHTML = `<div class="error">
            Failed to load content: ${error.message}<br>
            URL: ${contentUrl}
        </div>`;
    }
    console.log('=== loadRemoteMarkdownContent END ===');
}

// Function to highlight code blocks
function highlightCodeBlocks(container) {
    try {
        console.log('Highlighting code blocks');
        container.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    } catch (error) {
        console.error('Error in highlightCodeBlocks:', error);
    }
}