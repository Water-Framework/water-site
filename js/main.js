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
                displayMarkdownContent(markdown)

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

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    initializeDocumentation();
});

// Main initialization function
function initializeDocumentation() {
    // Get all submenu links
    const subMenuLinks = document.querySelectorAll('.sub-menu a');
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
        });
    });

    // Add click handlers to top menu items
    const topMenuLinks = document.querySelectorAll('.docs-nav > ul > li > a[data-md]');
    topMenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Top menu click on:', this.textContent);
            console.log('Data MD:', this.getAttribute('data-md'));
            
            // Load local markdown content
            loadMarkdownContent(this.getAttribute('data-md'));
        });
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

// Function to load local markdown content
function loadMarkdownContent(mdFile) {
    try {
        console.log('=== loadMarkdownContent START ===');
        console.log('Loading markdown file:', mdFile);
        
        // Get the docs content container
        const docsContent = document.getElementById('docs-content');
        
        // Show loading state
        docsContent.innerHTML = '<div class="loading">Loading content...</div>';

        // Fetch and process content
        fetch(mdFile)
            .then(response => {
                console.log('Fetch response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => {
                console.log('Content received:', text.substring(0, 200) + '...');
                if (!text) {
                    throw new Error('Received empty content');
                }
                // Use the display function to show the content
                displayMarkdownContent(text);
            })
            .catch(error => {
                console.error('Error loading content:', error);
                docsContent.innerHTML = `<div class="error">
                    Failed to load content: ${error.message}<br>
                    File: ${mdFile}
                </div>`;
            });

        console.log('=== loadMarkdownContent END ===');
    } catch (error) {
        console.error('Error in loadMarkdownContent:', error);
    }
}

// Function to load remote markdown content
function loadRemoteMarkdownContent(element) {
    try {
        console.log('=== loadRemoteMarkdownContent START ===');
        console.log('Element:', element);
        console.log('Element href:', element.href);
        
        const remoteMdPath = element.getAttribute('remote-md');
        console.log('remoteMdPath:', remoteMdPath);
        
        if (!remoteMdPath) {
            console.error('No remote-md attribute specified');
            const docsContent = document.getElementById('docs-content');
            docsContent.innerHTML = '<div class="error">No remote-md attribute specified</div>';
            return;
        }
        
        // Get the docs content container
        const docsContent = document.getElementById('docs-content');
        
        // Show loading state
        docsContent.innerHTML = '<div class="loading">Loading content...</div>';

        // Convert GitHub blob URL to raw content URL
        const contentUrl = remoteMdPath
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');

        console.log('Fetching content from:', contentUrl);
        
        // Fetch and process content
        fetch(contentUrl)
            .then(response => {
                console.log('Fetch response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => {
                console.log('Content received:', text.substring(0, 200) + '...');
                if (!text) {
                    throw new Error('Received empty content');
                }
                // Use the display function to show the content
                displayMarkdownContent(text);
            })
            .catch(error => {
                console.error('Error loading content:', error);
                docsContent.innerHTML = `<div class="error">
                    Failed to load content: ${error.message}<br>
                    URL: ${contentUrl}
                </div>`;
            });

        console.log('=== loadRemoteMarkdownContent END ===');
    } catch (error) {
        console.error('Error in loadRemoteMarkdownContent:', error);
    }
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