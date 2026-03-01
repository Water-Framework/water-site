// Constants
const SELECTORS = {
    SIDEBAR: '.docs-sidebar',
    MENU_ITEMS: '.docs-sidebar nav ul > li > a',
    SUBMENU_ITEMS: '.docs-sidebar nav ul li .sub-menu a',
    DOCS_CONTENT: '#docs-content',
    MOBILE_MENU_TOGGLE: '.mobile-menu-toggle',
    NAV_LINKS: '.nav-links',
    SIDEBAR_TOGGLE: '.sidebar-toggle'
};

const CLASSES = {
    SHOW_SUBMENU: 'show-submenu',
    LOADING: 'loading',
    ERROR: 'error',
    ACTIVE: 'active'
};

// Utility functions
const utils = {
    log: (message, data) => {
        console.log(message, data || '');
    },
    
    error: (message, error) => {
        console.error(message, error);
    },
    
    getElement: (selector) => document.querySelector(selector),
    
    getElements: (selector) => document.querySelectorAll(selector),
    
    createElement: (tag, className, content) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    },

    toggleClass: (element, className) => {
        element.classList.toggle(className);
    },

    // New utility function to get URL parameters
    getUrlParameter: (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // New utility function to update URL without page reload
    updateUrlParameter: (name, value) => {
        const url = new URL(window.location);
        if (value) {
            url.searchParams.set(name, value);
        } else {
            url.searchParams.delete(name);
        }
        window.history.pushState({}, '', url);
    }
};

// Mobile Manager class to handle mobile-specific functionality
class MobileManager {
    constructor() {
        this.initializeMobileMenu();
        this.initializeSidebarToggle();
        this.initializeResizeHandler();
    }

    initializeMobileMenu() {
        const menuToggle = utils.getElement(SELECTORS.MOBILE_MENU_TOGGLE);
        const navLinks = utils.getElement(SELECTORS.NAV_LINKS);

        menuToggle.addEventListener('click', () => {
            utils.toggleClass(navLinks, CLASSES.ACTIVE);
            utils.toggleClass(menuToggle, CLASSES.ACTIVE);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav')) {
                navLinks.classList.remove(CLASSES.ACTIVE);
                menuToggle.classList.remove(CLASSES.ACTIVE);
            }
        });
    }

    initializeSidebarToggle() {
        const mobileToggle = utils.getElement('.mobile-toggle');
        const desktopToggle = utils.getElement('.desktop-toggle');
        const sidebar = utils.getElement(SELECTORS.SIDEBAR);

        // Function to toggle sidebar
        const toggleSidebar = () => {
            utils.toggleClass(sidebar, CLASSES.ACTIVE);
            if (mobileToggle) utils.toggleClass(mobileToggle, CLASSES.ACTIVE);
            if (desktopToggle) utils.toggleClass(desktopToggle, CLASSES.ACTIVE);
        };

        // Add event listeners for both toggle buttons
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
        }

        if (desktopToggle && sidebar) {
            desktopToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Desktop behavior: collapse/expand sidebar
                if (window.innerWidth > 768) {
                    utils.toggleClass(sidebar, 'collapsed');
                    utils.toggleClass(desktopToggle, CLASSES.ACTIVE);
                    
                    // Also toggle content area
                    const docsContent = utils.getElement('.docs-content');
                    if (docsContent) {
                        utils.toggleClass(docsContent, 'expanded');
                    }
                } else {
                    // Mobile behavior: show/hide sidebar
                    toggleSidebar();
                }
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !e.target.closest(SELECTORS.SIDEBAR) && 
                !e.target.closest('.mobile-toggle')) {
                sidebar.classList.remove(CLASSES.ACTIVE);
                if (mobileToggle) mobileToggle.classList.remove(CLASSES.ACTIVE);
            }
        });
    }

    initializeResizeHandler() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) {
                    // Reset mobile states when switching to desktop
                    utils.getElement(SELECTORS.NAV_LINKS).classList.remove(CLASSES.ACTIVE);
                    utils.getElement(SELECTORS.MOBILE_MENU_TOGGLE).classList.remove(CLASSES.ACTIVE);
                    const sidebar = utils.getElement(SELECTORS.SIDEBAR);
                    const mobileToggle = utils.getElement('.mobile-toggle');
                    const desktopToggle = utils.getElement('.desktop-toggle');
                    const docsContent = utils.getElement('.docs-content');
                    
                    // Reset mobile sidebar state
                    if (sidebar) sidebar.classList.remove(CLASSES.ACTIVE);
                    if (mobileToggle) mobileToggle.classList.remove(CLASSES.ACTIVE);
                    
                    // Reset desktop sidebar state (expand by default)
                    if (sidebar) sidebar.classList.remove('collapsed');
                    if (desktopToggle) desktopToggle.classList.remove(CLASSES.ACTIVE);
                    if (docsContent) docsContent.classList.remove('expanded');
                }
            }, 250);
        });
    }
}

// Menu Manager class to handle all menu-related functionality
class MenuManager {
    constructor() {
        this.initializeEventListeners();
        this.initializeDefaultSection();
    }

    initializeDefaultSection() {
        // Check for page parameter first
        const pageParam = utils.getUrlParameter('page');
        
        if (pageParam) {
            this.loadSectionByPageParam(pageParam);
        } else {
            // Find and highlight the Introduction section by default
            const introductionLink = utils.getElement('a[href="#introduction"]');
            if (introductionLink) {
                this.selectMenuItemAndLoadContent(introductionLink);
            } else {
                // Fallback: if no introduction link found, try to load the first available section
                const firstSectionLink = utils.getElement('a[data-md]');
                if (firstSectionLink) {
                    this.selectMenuItemAndLoadContent(firstSectionLink);
                }
            }
        }
    }

    loadSectionByPageParam(pageParam) {
        utils.log('Loading section by page parameter:', pageParam);
        
        // Find the menu item that matches the page parameter
        const targetLink = utils.getElement(`a[href="#${pageParam}"]`);
        
        if (targetLink) {
            utils.log('Found target link:', targetLink.textContent);
            this.selectMenuItemAndLoadContent(targetLink);
        } else {
            utils.log('Page parameter not found:', pageParam);
            // Try to find a similar link or fallback to default behavior
            const fallbackLink = this.findFallbackLink(pageParam);
            if (fallbackLink) {
                utils.log('Using fallback link:', fallbackLink.textContent);
                this.selectMenuItemAndLoadContent(fallbackLink);
            } else {
                // Fallback to default behavior
                this.initializeDefaultSection();
            }
        }
    }

    findFallbackLink(pageParam) {
        // Try to find a link that contains the page parameter in its href
        const allLinks = utils.getElements('a[href*="#"]');
        for (const link of allLinks) {
            const href = link.getAttribute('href');
            if (href.includes(pageParam) || href.toLowerCase().includes(pageParam.toLowerCase())) {
                return link;
            }
        }
        return null;
    }

    // Unified function to handle menu selection and content loading
    selectMenuItemAndLoadContent(link) {
        utils.log('=== selectMenuItemAndLoadContent START ===');
        utils.log('Selecting menu item:', link.textContent);
        utils.log('Link href:', link.getAttribute('href'));
        utils.log('Link element:', link);
        utils.log('Link parent:', link.parentElement);
        utils.log('Link is submenu item:', !!link.closest('.sub-menu'));
        
        // Activate the menu item (this handles menu highlighting and submenu opening)
        this.activateMenuItem(link);
        
        // Load content based on the link type
        if (link.hasAttribute('data-md')) {
            const dataMd = link.getAttribute('data-md');
            utils.log('Loading local content:', dataMd);
            ContentLoader.loadLocalContent(dataMd);
        } else if (link.hasAttribute('remote-md')) {
            const remoteMd = link.getAttribute('remote-md');
            utils.log('Loading remote content:', remoteMd);
            ContentLoader.loadRemoteContent(link);
        } else {
            // If no content attribute, check if it's a section with submenu
            const parentLi = link.parentElement;
            const submenu = parentLi.querySelector('.sub-menu');
            if (submenu) {
                utils.log('No content attributes found, but section has submenu - generating overview');
                this.generateSectionOverview(link, submenu);
            } else {
                utils.log('No content found for link, showing under construction');
                const docsContent = utils.getElement(SELECTORS.DOCS_CONTENT);
                docsContent.innerHTML = ContentLoader.createUnderConstructionContent();
            }
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        utils.log('=== selectMenuItemAndLoadContent END ===');
    }

    activateMenuItem(link) {
        utils.log('=== activateMenuItem START ===');
        utils.log('Activating menu item:', link.textContent);
        utils.log('Link href:', link.getAttribute('href'));
        
        // Remove active class from all menu items
        const menuItems = utils.getElements(SELECTORS.MENU_ITEMS);
        const submenuItems = utils.getElements(SELECTORS.SUBMENU_ITEMS);
        
        utils.log('Removing active class from menu items:', menuItems.length);
        utils.log('Removing active class from submenu items:', submenuItems.length);
        
        menuItems.forEach(item => {
            item.classList.remove(CLASSES.ACTIVE);
        });
        submenuItems.forEach(item => {
            item.classList.remove(CLASSES.ACTIVE);
        });
        
        // Add active class to target link
        utils.log('Adding active class to target link:', link.textContent);
        link.classList.add(CLASSES.ACTIVE);
        utils.log('Target link classes after adding active:', link.classList.toString());
        
        // Open parent submenu if it's a submenu item
        const submenu = link.closest('.sub-menu');
        if (submenu) {
            utils.log('Link is in submenu, opening parent submenu');
            const parentLi = submenu.parentElement;
            parentLi.classList.add(CLASSES.SHOW_SUBMENU);
            utils.log('Parent li classes after adding show-submenu:', parentLi.classList.toString());
            
            // Also highlight the parent section menu item
            const parentLink = parentLi.children[0]; // Get the first child (should be the anchor)
            if (parentLink && parentLink.tagName === 'A') {
                utils.log('Highlighting parent section menu item:', parentLink.textContent);
                parentLink.classList.add(CLASSES.ACTIVE);
                utils.log('Parent link classes after adding active:', parentLink.classList.toString());
            } else {
                utils.log('Parent link not found or not an anchor');
            }
        } else {
            utils.log('Link is not in submenu');
        }
        
        // Update URL parameter
        const sectionId = link.getAttribute('href').substring(1); // Remove the #
        utils.log('Updating URL parameter with sectionId:', sectionId);
        utils.updateUrlParameter('page', sectionId);
        
        utils.log('=== activateMenuItem END ===');
    }

    initializeEventListeners() {
        // Add a small delay to ensure DOM is fully ready
        setTimeout(() => {
            this.initializeSubmenuItems();
            this.initializeTopMenuItems();
            this.initializeDocumentClick();
        }, 100);
    }

    initializeSubmenuItems() {
        const subMenuLinks = utils.getElements(SELECTORS.SUBMENU_ITEMS);
        utils.log('Found submenu links:', subMenuLinks.length);
        
        // Log all found submenu links for debugging
        subMenuLinks.forEach((link, index) => {
            utils.log(`Submenu link ${index + 1}:`, {
                text: link.textContent.trim(),
                href: link.getAttribute('href'),
                hasDataMd: link.hasAttribute('data-md'),
                hasRemoteMd: link.hasAttribute('remote-md'),
                dataMd: link.getAttribute('data-md'),
                remoteMd: link.getAttribute('remote-md')
            });
        });

        subMenuLinks.forEach(link => {
            this.setupSubmenuItem(link);
        });
    }

    setupSubmenuItem(link) {
        utils.log('Adding click handler to:', link.textContent);
        
        // Remove any existing click handlers by cloning
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Add the click handler to the new link
        newLink.addEventListener('click', (e) => this.handleSubmenuItemClick(e, newLink));
        
        utils.log('Click handler added successfully to:', newLink.textContent);
    }

    handleSubmenuItemClick(e, link) {
        e.preventDefault();
        e.stopPropagation();
        
        utils.log('=== handleSubmenuItemClick START ===');
        utils.log('Direct click on:', link.textContent);
        utils.log('Link href:', link.getAttribute('href'));
        utils.log('Remote MD:', link.getAttribute('remote-md'));
        utils.log('Data MD:', link.getAttribute('data-md'));
        utils.log('Link element:', link);
        
        // Use the unified function to handle menu selection and content loading
        this.selectMenuItemAndLoadContent(link);
        
        utils.log('=== handleSubmenuItemClick END ===');
    }

    initializeTopMenuItems() {
        const topMenuLinks = utils.getElements(SELECTORS.MENU_ITEMS);
        utils.log('Found top menu links:', topMenuLinks.length);
        
        topMenuLinks.forEach(link => {
            this.setupTopMenuItem(link);
        });
    }

    setupTopMenuItem(link) {
        utils.log('Adding click handler to top menu:', link.textContent);
        
        link.addEventListener('click', (e) => this.handleTopMenuItemClick(e, link));
    }

    handleTopMenuItemClick(e, link) {
        e.preventDefault();
        e.stopPropagation();
        
        utils.log('Top menu click on:', link.textContent);
        
        // Check if this is a section with submenu
        const parentLi = link.parentElement;
        const submenu = parentLi.querySelector('.sub-menu');
        
        if (submenu) {
            // This is a section with submenu - activate the parent section and show overview
            utils.log('Section has submenu, activating parent and showing overview');
            this.activateMenuItem(link);
            this.handleSubmenuVisibility(link);
            
            // Generate and display section overview in main content area
            this.generateSectionOverview(link, submenu);
        } else {
            // This is a direct link - activate it and load content
            utils.log('Direct link, loading content');
            this.selectMenuItemAndLoadContent(link);
        }
    }

    generateSectionOverview(sectionLink, subMenu) {
        const sectionTitle = sectionLink.textContent.trim();
        const sectionId = sectionLink.getAttribute('href').substring(1);
        
        // Clean up any existing TOC content in the sidebar
        this.cleanupSidebarTOC();
        
        // Get section description
        const description = this.getSectionDescriptions()[sectionId] || 
                          this.getSubsectionDescription(sectionTitle, sectionId);
        
        // Create overview HTML
        let overviewHTML = `
            <div class="section-overview">
                <h1>${sectionTitle}</h1>
                <p class="section-description">${description}</p>
                
                <div class="section-toc">
                    <h2>📚 Table of Contents</h2>
                    <div class="toc-grid">
        `;
        
        // Add TOC items for each subsection
        const subMenuItems = subMenu.querySelectorAll('a');
        subMenuItems.forEach((item, index) => {
            const itemTitle = item.textContent;
            const itemHref = item.getAttribute('href');
            const hasRemoteMd = item.hasAttribute('remote-md');
            const hasDataMd = item.hasAttribute('data-md');
            
            overviewHTML += `
                <div class="toc-item" data-href="${itemHref}" data-remote="${hasRemoteMd ? item.getAttribute('remote-md') : ''}" data-md="${hasDataMd ? item.getAttribute('data-md') : ''}">
                    <div class="toc-number">${(index + 1).toString().padStart(2, '0')}</div>
                    <div class="toc-content">
                        <h3>${itemTitle}</h3>
                        <p>${this.getSubsectionDescription(itemTitle, sectionId)}</p>
                    </div>
                    <div class="toc-arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            `;
        });
        
        overviewHTML += `
                    </div>
                </div>
            </div>
        `;
        
        // Display in main content area
        const docsContent = utils.getElement(SELECTORS.DOCS_CONTENT);
        const contentWrapper = utils.createElement('div', 'markdown-content');
        contentWrapper.innerHTML = overviewHTML;
        docsContent.innerHTML = '';
        docsContent.appendChild(contentWrapper);
        
        // Add click handlers to TOC items with a small delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeTOCItemHandlers();
        }, 50);
    }

    cleanupSidebarTOC() {
        // Remove any existing TOC content from the sidebar
        const existingTOC = utils.getElements('.section-toc');
        existingTOC.forEach(toc => {
            if (toc.closest('.docs-sidebar')) {
                toc.remove();
            }
        });
    }

    generateSectionTOC(sectionLink, subMenu) {
        // This method is now deprecated - use generateSectionOverview instead
        // Keeping for backward compatibility but it should not be called
        utils.log('generateSectionTOC is deprecated - use generateSectionOverview instead');
    }

    getSectionDescriptions() {
        return {
            'ai-powered-development': 'Supercharge development velocity with Claude Code and the yo water Yeoman generator. Build microservices in minutes.',
            'basic-concepts': 'Core concepts and fundamental building blocks of the Water Framework.',
            'persistence': 'Data persistence and repository patterns for managing entities.',
            'permission': 'Security and permission management system.',
            'rest-api': 'REST API development and integration patterns.',
            'architecture': 'System architecture and design patterns.',
            'service-mesh-integration': 'Service mesh wiring, API Gateway, Service Discovery, and integration clients.',
            'clustering': 'Clustering and distributed system capabilities.',
            'microservices': 'Microservices architecture and patterns.',
            'best-practices': 'Development best practices and guidelines.',
            'implementations': 'Framework implementations for different platforms.',
            'modules': 'All available Water Framework modules — core, security, service mesh, and connectors.'
        };
    }

    getSubsectionDescription(subsectionTitle, sectionId) {
        const descriptions = {
            'service-architecture': 'Understanding the service-oriented architecture of Water Framework.',
            'entity-management': 'How to manage entities and their lifecycle.',
            'water-resources-entities': 'Core resource and entity concepts.',
            'shared-entities': 'Sharing entities between users and organizations.',
            'validation': 'Data validation and business rule enforcement.',
            'event-management': 'Event-driven architecture and messaging.',
            'security-permissions': 'Security model and permission system.',
            'component-lifecycle': 'Component lifecycle management and dependency injection.',
            'interceptors-aop': 'Aspect-oriented programming with interceptors.',
            'jpa-repository': 'JPA-based repository implementation.',
            'query-filter-system': 'Advanced querying and filtering capabilities.',
            'entity-extensions': 'Extending entities with custom functionality.',
            'permission-annotations': 'Using annotations for permission management.',
            'defining-roles-permissions': 'Defining roles and permissions for entities.',
            'custom-checking-permissions': 'Creating custom permission managers.',
            'rest-service-layer': 'Building REST services with Water Framework.',
            'rest-security': 'Securing REST APIs and integration patterns.',
            'api-documentation': 'API documentation and versioning strategies.',
            'system-architecture': 'High-level system architecture overview.',
            'component-interaction': 'How components interact and communicate.',
            'security-flows': 'Security and permission flow patterns.',
            'clustering-overview': 'Clustering architecture and benefits.',
            'distributed-components': 'Distributed component patterns.',
            'cluster-coordination': 'Cluster coordination and synchronization.',
            'microservices-overview': 'Microservices architecture patterns.',
            'ai-productivity': 'Scaffold and build microservices with Claude Code and the yo water generator.',
            'generator-reference': 'Complete reference for all yo water generator commands.',
            'service-mesh': 'Declarative service mesh wiring with waterDescriptor output and input PINs.',
            'api-gateway': 'API Gateway module: dynamic routing, circuit breaker, rate limiting, and load balancing.',
            'service-discovery': 'Service Discovery: dynamic service registration and resolution across the Water mesh.',
            'integration-clients': 'Remote integration clients for cross-service communication via REST.',
            'distributed-tracing': 'Distributed tracing and observability.',
            'development-patterns': 'Recommended development patterns.',
            'testing-strategies': 'Testing strategies and best practices.',
            'performance-scalability': 'Performance optimization and scalability.',
            'spring-integration': 'Spring Framework integration.',
            'osgi-integration': 'OSGi container integration.',
            'quarkus-integration': 'Quarkus framework integration.'
        };
        
        // Try to find the description by the subsection title (converted to key format)
        const key = subsectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        return descriptions[key] || `Learn about ${subsectionTitle.toLowerCase()}.`;
    }

    initializeTOCItemHandlers() {
        const tocItems = utils.getElements('.toc-item');
        utils.log('=== initializeTOCItemHandlers START ===');
        utils.log('Found TOC items:', tocItems.length);
        
        tocItems.forEach((item, index) => {
            utils.log(`TOC item ${index + 1}:`, {
                text: item.querySelector('.toc-content h3')?.textContent,
                href: item.getAttribute('data-href'),
                remoteMd: item.getAttribute('data-remote'),
                dataMd: item.getAttribute('data-md')
            });
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                utils.log('=== TOC Item Click START ===');
                utils.log('Clicked TOC item:', item.querySelector('.toc-content h3')?.textContent);
                
                // Find the corresponding menu item
                const href = item.getAttribute('data-href');
                const remoteMd = item.getAttribute('data-remote');
                const dataMd = item.getAttribute('data-md');
                
                utils.log('TOC item data:', { href, remoteMd, dataMd });
                
                let targetLink = utils.getElement(`a[href="${href}"]`);
                utils.log('Target link found:', targetLink);
                utils.log('Target link text:', targetLink?.textContent);
                utils.log('Target link href:', targetLink?.getAttribute('href'));
                
                if (targetLink) {
                    utils.log('Calling selectMenuItemAndLoadContent with target link');
                    // Use the unified function to handle menu selection and content loading
                    this.selectMenuItemAndLoadContent(targetLink);
                } else {
                    utils.log('Target link not found for href:', href);
                    utils.log('All available links with href:', href);
                    const allLinks = utils.getElements('a');
                    allLinks.forEach(link => {
                        if (link.getAttribute('href') === href) {
                            utils.log('Found matching link:', link.textContent);
                        }
                    });
                }
                
                utils.log('=== TOC Item Click END ===');
            });
        });
        
        utils.log('=== initializeTOCItemHandlers END ===');
    }

    handleSubmenuVisibility(link) {
        const parentLi = link.parentElement;
        const currentSubmenu = parentLi.querySelector('.sub-menu');
        
        if (currentSubmenu) {
            // Close all other submenus first
            this.closeSiblingSubmenus(parentLi);
            
            // Toggle current submenu
            this.toggleSubmenu(parentLi);
        }
    }

    closeSiblingSubmenus(currentLi) {
        const siblingLis = currentLi.parentElement.children;
        Array.from(siblingLis).forEach(li => {
            if (li !== currentLi) {
                li.classList.remove(CLASSES.SHOW_SUBMENU);
            }
        });
    }

    toggleSubmenu(parentLi) {
        parentLi.classList.toggle(CLASSES.SHOW_SUBMENU);
    }

    initializeDocumentClick() {
        document.addEventListener('click', (e) => {
            // Close submenus when clicking outside
            if (!e.target.closest('.docs-sidebar')) {
                this.closeAllSubmenus();
            }
        });
    }

    closeAllSubmenus() {
        const submenus = utils.getElements('.sub-menu');
        submenus.forEach(submenu => {
            const parentLi = submenu.parentElement;
            parentLi.classList.remove(CLASSES.SHOW_SUBMENU);
        });
    }
}

// Content Loader class to handle all content loading functionality
class ContentLoader {
    static async loadLocalContent(mdFile) {
        try {
            utils.log('=== loadLocalContent START ===');
            utils.log('Loading markdown file:', mdFile);
            
            const docsContent = utils.getElement(SELECTORS.DOCS_CONTENT);
            docsContent.innerHTML = utils.createElement('div', CLASSES.LOADING, 'Loading content...').outerHTML;
            
            const response = await fetch(`content/${mdFile}`);
            utils.log('Fetch response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            utils.log('Content received:', text.substring(0, 200) + '...');
            
            if (!text) {
                throw new Error('Received empty content');
            }
            
            this.displayContent(text, docsContent);
        } catch (error) {
            this.handleError(error, mdFile);
        }
        utils.log('=== loadLocalContent END ===');
    }

    static async loadRemoteContent(element) {
        try {
            utils.log('=== loadRemoteContent START ===');
            const contentUrl = element.getAttribute('remote-md');
            utils.log('Loading remote content from:', contentUrl);
            
            const docsContent = utils.getElement(SELECTORS.DOCS_CONTENT);
            docsContent.innerHTML = utils.createElement('div', CLASSES.LOADING, 'Loading content...').outerHTML;
            
            const response = await fetch(contentUrl);
            utils.log('Fetch response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            utils.log('Content received:', text.substring(0, 200) + '...');
            
            if (!text) {
                throw new Error('Received empty content');
            }
            
            this.displayContent(text, docsContent);
        } catch (error) {
            this.handleError(error, element.getAttribute('remote-md'));
        }
        utils.log('=== loadRemoteContent END ===');
    }

    static displayContent(text, container) {
        // Check if content is empty or just whitespace
        if (!text || text.trim() === '') {
            const contentWrapper = utils.createElement('div', 'markdown-content');
            contentWrapper.innerHTML = this.createUnderConstructionContent();
            container.innerHTML = '';
            container.appendChild(contentWrapper);
            return;
        }

        const html = marked.parse(text);
        const contentWrapper = utils.createElement('div', 'markdown-content');
        contentWrapper.innerHTML = html;
        
        // Add IDs to headings
        this.addHeadingIds(contentWrapper);
        
        container.innerHTML = '';
        container.appendChild(contentWrapper);
        this.highlightCodeBlocks(contentWrapper);
    }

    static addHeadingIds(container) {
        // Find all heading elements (h1, h2, h3, h4, h5, h6)
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headings.forEach(heading => {
            // Get the text content of the heading
            const text = heading.textContent.trim();
            
            // Convert to URL-friendly ID
            const id = this.generateHeadingId(text);
            
            // Set the ID if it doesn't already exist
            if (!heading.id) {
                heading.id = id;
            }
        });
    }

    static generateHeadingId(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
    }

    static handleError(error, source) {
        utils.error('Error loading content:', error);
        const docsContent = utils.getElement(SELECTORS.DOCS_CONTENT);
        const contentWrapper = utils.createElement('div', 'markdown-content');
        contentWrapper.innerHTML = this.createUnderConstructionContent();
        docsContent.innerHTML = '';
        docsContent.appendChild(contentWrapper);
    }

    static createUnderConstructionContent() {
        return `
            <div class="under-construction">
                <div class="construction-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#FFA500"/>
                        <path d="M19 14L20.09 20.26L27 21L20.09 21.74L19 28L17.91 21.74L11 21L17.91 20.26L19 14Z" fill="#FFA500"/>
                        <path d="M5 14L6.09 20.26L13 21L6.09 21.74L5 28L3.91 21.74L-3 21L3.91 20.26L5 14Z" fill="#FFA500"/>
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#FFA500" opacity="0.3"/>
                        <path d="M19 14L20.09 20.26L27 21L20.09 21.74L19 28L17.91 21.74L11 21L17.91 20.26L19 14Z" fill="#FFA500" opacity="0.3"/>
                        <path d="M5 14L6.09 20.26L13 21L6.09 21.74L5 28L3.91 21.74L-3 21L3.91 20.26L5 14Z" fill="#FFA500" opacity="0.3"/>
                    </svg>
                </div>
                <h2>🚧 Under Construction 🚧</h2>
                <p>This section is currently being developed and will be available soon.</p>
                <p>Please check back later for updates.</p>
            </div>
        `;
    }

    static highlightCodeBlocks(container) {
        try {
            utils.log('Highlighting code blocks');
            container.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } catch (error) {
            utils.error('Error in highlightCodeBlocks:', error);
        }
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    utils.log('DOM fully loaded');
    
    // Initialize MenuManager (for documentation pages)
    if (utils.getElement('.docs-sidebar') || utils.getElement('.docs-content')) {
        utils.log('Initializing MenuManager for documentation page');
        new MenuManager();
    }
    
    // Initialize MobileManager (for pages with mobile menu)
    if (utils.getElement('.mobile-menu-toggle') || utils.getElement('.mobile-toggle')) {
        utils.log('Initializing MobileManager for mobile functionality');
        new MobileManager();
    }
});