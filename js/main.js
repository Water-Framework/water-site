// Constants
const SELECTORS = {
    SIDEBAR: '.docs-sidebar',
    MENU_ITEMS: '.docs-sidebar nav ul > li > a',
    SUBMENU_ITEMS: '.docs-sidebar nav ul li .sub-menu a',
    DOCS_CONTENT: '#docs-content'
};

const CLASSES = {
    SHOW_SUBMENU: 'show-submenu',
    LOADING: 'loading',
    ERROR: 'error'
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
    }
};

// Menu Manager class to handle all menu-related functionality
class MenuManager {
    constructor() {
        this.initializeEventListeners();
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
        
        // Load remote markdown content
        ContentLoader.loadRemoteContent(link);
        
        // Keep only the current submenu open
        const currentSubmenu = link.closest('.sub-menu');
        const parentLi = currentSubmenu.parentElement;
        parentLi.classList.add(CLASSES.SHOW_SUBMENU);
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
        
        // If it has data-md attribute, load local content
        if (link.hasAttribute('data-md')) {
            utils.log('Data MD:', link.getAttribute('data-md'));
            ContentLoader.loadLocalContent(link.getAttribute('data-md'));
        }
        
        this.handleSubmenuVisibility(link);
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
            if (!e.target.closest(SELECTORS.SIDEBAR)) {
                utils.log('Click outside sidebar, closing all submenus');
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
        const html = marked.parse(text);
        const contentWrapper = utils.createElement('div', 'markdown-content');
        contentWrapper.innerHTML = html;
        container.innerHTML = '';
        container.appendChild(contentWrapper);
        this.highlightCodeBlocks(contentWrapper);
    }

    static handleError(error, source) {
        utils.error('Error loading content:', error);
        const docsContent = utils.getElement(SELECTORS.DOCS_CONTENT);
        docsContent.innerHTML = utils.createElement('div', CLASSES.ERROR, `
            Failed to load content: ${error.message}<br>
            Source: ${source}
        `).outerHTML;
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
});