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
        const sidebarToggle = utils.getElement(SELECTORS.SIDEBAR_TOGGLE);
        const sidebar = utils.getElement(SELECTORS.SIDEBAR);

        sidebarToggle.addEventListener('click', () => {
            utils.toggleClass(sidebar, CLASSES.ACTIVE);
            utils.toggleClass(sidebarToggle, CLASSES.ACTIVE);
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !e.target.closest(SELECTORS.SIDEBAR) && 
                !e.target.closest(SELECTORS.SIDEBAR_TOGGLE)) {
                sidebar.classList.remove(CLASSES.ACTIVE);
                sidebarToggle.classList.remove(CLASSES.ACTIVE);
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
                    utils.getElement(SELECTORS.SIDEBAR).classList.remove(CLASSES.ACTIVE);
                    utils.getElement(SELECTORS.SIDEBAR_TOGGLE).classList.remove(CLASSES.ACTIVE);
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
        // Find and highlight the Introduction section by default
        const introductionLink = utils.getElement('a[href="#introduction"]');
        if (introductionLink) {
            introductionLink.classList.add(CLASSES.ACTIVE);
            // Load the introduction content
            if (introductionLink.hasAttribute('data-md')) {
                ContentLoader.loadLocalContent(introductionLink.getAttribute('data-md'));
            }
        } else {
            // Fallback: if no introduction link found, try to load the first available section
            const firstSectionLink = utils.getElement('a[data-md]');
            if (firstSectionLink) {
                firstSectionLink.classList.add(CLASSES.ACTIVE);
                ContentLoader.loadLocalContent(firstSectionLink.getAttribute('data-md'));
            }
        }
    }

    initializeEventListeners() {
        this.initializeSubmenuItems();
        this.initializeTopMenuItems();
        this.initializeDocumentClick();
    }

    initializeSubmenuItems() {
        const subMenuLinks = utils.getElements(SELECTORS.SUBMENU_ITEMS);
        utils.log('Found submenu links:', subMenuLinks.length);

        subMenuLinks.forEach(link => {
            this.setupSubmenuItem(link);
        });
    }

    setupSubmenuItem(link) {
        utils.log('Adding click handler to:', link.textContent);
        
        // Remove any existing click handlers
        link.replaceWith(link.cloneNode(true));
        
        // Get the fresh reference after cloning
        const freshLink = utils.getElement(`.sub-menu a[href="${link.getAttribute('href')}"]`);
        
        // Add the click handler
        freshLink.addEventListener('click', (e) => this.handleSubmenuItemClick(e, freshLink));
    }

    handleSubmenuItemClick(e, link) {
        e.preventDefault();
        e.stopPropagation();
        
        utils.log('Direct click on:', link.textContent);
        utils.log('Remote MD:', link.getAttribute('remote-md'));
        
        // Remove active class from all menu items
        utils.getElements(SELECTORS.MENU_ITEMS).forEach(item => item.classList.remove(CLASSES.ACTIVE));
        utils.getElements(SELECTORS.SUBMENU_ITEMS).forEach(item => item.classList.remove(CLASSES.ACTIVE));
        
        // Add active class to clicked item
        link.classList.add(CLASSES.ACTIVE);
        
        // Load remote markdown content
        ContentLoader.loadRemoteContent(link);
        
        // Keep only the current submenu open
        const currentSubmenu = link.closest('.sub-menu');
        const parentLi = currentSubmenu.parentElement;
        parentLi.classList.add(CLASSES.SHOW_SUBMENU);
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
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
        
        // Remove active class from all menu items
        utils.getElements(SELECTORS.MENU_ITEMS).forEach(item => item.classList.remove(CLASSES.ACTIVE));
        utils.getElements(SELECTORS.SUBMENU_ITEMS).forEach(item => item.classList.remove(CLASSES.ACTIVE));
        
        // Add active class to clicked item
        link.classList.add(CLASSES.ACTIVE);
        
        // Check if this section has subsections
        const parentLi = link.parentElement;
        const subMenu = parentLi.querySelector('.sub-menu');
        
        if (subMenu && subMenu.children.length > 0) {
            // Generate TOC content for sections with subsections
            this.generateSectionTOC(link, subMenu);
        } else if (link.hasAttribute('data-md')) {
            // Load local content for sections without subsections
            utils.log('Data MD:', link.getAttribute('data-md'));
            ContentLoader.loadLocalContent(link.getAttribute('data-md'));
        }
        
        this.handleSubmenuVisibility(link);
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
    }

    generateSectionTOC(sectionLink, subMenu) {
        const sectionTitle = sectionLink.textContent;
        const sectionId = sectionLink.getAttribute('href').substring(1);
        const subMenuItems = Array.from(subMenu.querySelectorAll('a'));
        
        // Get section descriptions from a mapping
        const sectionDescriptions = this.getSectionDescriptions();
        const description = sectionDescriptions[sectionId] || `Explore the ${sectionTitle.toLowerCase()} concepts and features of Water Framework.`;
        
        let tocHTML = `
            <div class="section-overview">
                <h1>${sectionTitle}</h1>
                <p class="section-description">${description}</p>
                
                <div class="section-toc">
                    <h2>📚 Table of Contents</h2>
                    <div class="toc-grid">
        `;
        
        subMenuItems.forEach((item, index) => {
            const itemTitle = item.textContent;
            const itemHref = item.getAttribute('href');
            const hasRemoteMd = item.hasAttribute('remote-md');
            const hasDataMd = item.hasAttribute('data-md');
            
            tocHTML += `
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
        
        tocHTML += `
                    </div>
                </div>
            </div>
        `;
        
        const docsContent = utils.getElement(SELECTORS.DOCS_CONTENT);
        docsContent.innerHTML = tocHTML;
        
        // Add click handlers to TOC items
        this.initializeTOCItemHandlers();
    }

    getSectionDescriptions() {
        return {
            'basic-concepts': 'Core concepts and fundamental building blocks of Water Framework, including service architecture, entity management, security, and component lifecycle.',
            'persistence': 'Comprehensive data access and persistence layer providing JPA repository framework, query system, and entity extensions.',
            'permission': 'Advanced permission system for fine-grained access control, role management, and custom permission checking.',
            'rest-api': 'REST API framework for building web services with security, documentation, and versioning capabilities.',
            'architecture': 'System architecture overview, component interaction flows, and security patterns for enterprise applications.',
            'clustering': 'Clustering and distributed computing capabilities for high availability and scalability.',
            'microservices': 'Microservices architecture support including service discovery, mesh integration, and distributed tracing.',
            'best-practices': 'Development patterns, testing strategies, and performance optimization guidelines.',
            'implementations': 'Framework implementations for Spring, OSGi, and Quarkus with integration examples.',
            'modules': 'Ready-to-use modules providing authentication, document management, blockchain integration, and more.'
        };
    }

    getSubsectionDescription(subsectionTitle, sectionId) {
        const descriptions = {
            'basic-concepts': {
                'Service Architecture': 'Learn about the service layer architecture and API design patterns.',
                'Entity Management': 'Understand entity lifecycle, validation, and management patterns.',
                'Water Resources and Entities': 'Explore resource management and entity relationships.',
                'Shared Entities': 'Discover how to work with shared and collaborative entities.',
                'Validation': 'Implement comprehensive validation strategies for your entities.',
                'Event Management': 'Handle events and notifications in your applications.',
                'Security & Permissions': 'Implement fine-grained security and permission controls.',
                'Component Lifecycle': 'Manage component initialization, activation, and cleanup.',
                'Interceptors & AOP': 'Use aspect-oriented programming for cross-cutting concerns.'
            },
            'persistence': {
                'JPA Repository Framework': 'Core repository pattern implementation with transaction management.',
                'Query & Filter System': 'Powerful query building and filtering capabilities.',
                'Entity Extensions & Validation': 'Extend entities with custom functionality and validation.'
            },
            'permission': {
                'Permission Annotations Management': 'Learn how to use permission annotations for automatic access control.',
                'Defining Roles and Permission for Your Entities': 'Configure roles and permissions for your domain entities.',
                'Custom Checking Permissions': 'Implement custom permission checking logic for complex scenarios.',
                'Custom Permission Manager': 'Create custom permission managers for specialized access control needs.'
            },
            'rest-api': {
                'REST Service Layer': 'Build RESTful web services with automatic endpoint generation.',
                'REST Security & Integration': 'Secure your REST APIs with authentication and authorization.',
                'API Documentation & Versioning': 'Generate API documentation and manage versioning.'
            },
            'architecture': {
                'System Architecture Overview': 'High-level system architecture and design principles.',
                'Component Interaction Flows': 'Understand how components communicate and interact.',
                'Security & Permission Flows': 'Security patterns and permission checking flows.'
            },
            'clustering': {
                'Clustering Overview': 'Introduction to clustering concepts and capabilities.',
                'Distributed Components': 'Build and deploy distributed components.',
                'Cluster Coordination': 'Coordinate activities across cluster nodes.'
            },
            'microservices': {
                'Microservices Overview': 'Microservices architecture and design patterns.',
                'Service Discovery': 'Discover and register services in a distributed environment.',
                'Service Mesh Integration': 'Integrate with service mesh technologies.',
                'Distributed Tracing': 'Trace requests across microservice boundaries.'
            },
            'best-practices': {
                'Development Patterns': 'Recommended development patterns and practices.',
                'Testing Strategies': 'Comprehensive testing approaches and strategies.',
                'Performance & Scalability': 'Optimize performance and ensure scalability.'
            },
            'implementations': {
                'Spring Integration': 'Integrate Water Framework with Spring Boot applications.',
                'OSGi Integration': 'Use Water Framework in OSGi environments.',
                'Quarkus Integration': 'Deploy Water Framework applications with Quarkus.'
            }
        };
        
        return descriptions[sectionId]?.[subsectionTitle] || `Learn about ${subsectionTitle.toLowerCase()} in Water Framework.`;
    }

    initializeTOCItemHandlers() {
        const tocItems = utils.getElements('.toc-item');
        tocItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all menu items
                utils.getElements(SELECTORS.MENU_ITEMS).forEach(menuItem => menuItem.classList.remove(CLASSES.ACTIVE));
                utils.getElements(SELECTORS.SUBMENU_ITEMS).forEach(subItem => subItem.classList.remove(CLASSES.ACTIVE));
                
                // Find and activate the corresponding menu item
                const href = item.getAttribute('data-href');
                const remoteMd = item.getAttribute('data-remote');
                const dataMd = item.getAttribute('data-md');
                
                let targetLink = utils.getElement(`a[href="${href}"]`);
                if (targetLink) {
                    targetLink.classList.add(CLASSES.ACTIVE);
                    
                    // Load the content
                    if (remoteMd) {
                        ContentLoader.loadRemoteContent(targetLink);
                    } else if (dataMd) {
                        ContentLoader.loadLocalContent(dataMd);
                    }
                }
                
                // Scroll to top
                window.scrollTo(0, 0);
            });
        });
    }

    handleSubmenuVisibility(link) {
        const parentLi = link.parentElement;
        const subMenu = parentLi.querySelector('.sub-menu');
        
        if (subMenu) {
            utils.log('Found submenu for:', link.textContent);
            this.closeSiblingSubmenus(parentLi);
            this.toggleSubmenu(parentLi);
        } else {
            utils.log('No submenu found for:', link.textContent);
            this.closeSiblingSubmenus(parentLi);
        }
    }

    closeSiblingSubmenus(currentLi) {
        const siblings = Array.from(currentLi.parentElement.children);
        siblings.forEach(sibling => {
            if (sibling !== currentLi && sibling.querySelector('.sub-menu')) {
                sibling.classList.remove(CLASSES.SHOW_SUBMENU);
            }
        });
    }

    toggleSubmenu(parentLi) {
        parentLi.classList.toggle(CLASSES.SHOW_SUBMENU);
        utils.log('Submenu visibility toggled:', parentLi.classList.contains(CLASSES.SHOW_SUBMENU));
    }

    initializeDocumentClick() {
        document.addEventListener('click', (e) => {
            // Only close submenus if clicking on a menu item (to navigate to a different section)
            // Don't close submenus when clicking on the content area
            if (e.target.closest(SELECTORS.MENU_ITEMS) || e.target.closest(SELECTORS.SUBMENU_ITEMS)) {
                // This will be handled by the individual menu item click handlers
                return;
            }
            
            // Don't close submenus when clicking on the content area
            if (e.target.closest(SELECTORS.DOCS_CONTENT)) {
                return;
            }
            
            // Only close submenus when clicking outside both sidebar and content area
            if (!e.target.closest(SELECTORS.SIDEBAR) && !e.target.closest(SELECTORS.DOCS_CONTENT)) {
                utils.log('Click outside sidebar and content, closing all submenus');
                this.closeAllSubmenus();
            }
        });
    }

    closeAllSubmenus() {
        utils.getElements(SELECTORS.MENU_ITEMS).forEach(item => {
            item.parentElement.classList.remove(CLASSES.SHOW_SUBMENU);
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
            container.innerHTML = this.createUnderConstructionContent();
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
        docsContent.innerHTML = this.createUnderConstructionContent();
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
    new MenuManager();
    new MobileManager();
});