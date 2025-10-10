/**
 * ============================================================================
 * SISTEMA DE NAVEGAÇÃO AVANÇADA - JAVASCRIPT
 * Atividade 2: CSS3 Avançado com Design System Profissional
 * ============================================================================
 */

class NavigationSystem {
  constructor() {
    this.activeDropdown = null;
    this.activeMegaMenu = null;
    this.sidebar = null;
    this.mobileMenu = null;
    this.scrollPosition = 0;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupScrollEffects();
    this.setupActivePageIndicators();
    this.setupKeyboardNavigation();
  }

  /**
   * ========== EVENT BINDINGS ==========
   */
  
  bindEvents() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Sidebar controls
    const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
    const sidebarClose = document.querySelector('.sidebar-close');
    
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }
    
    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => this.closeSidebar());
    }

    // Dropdown menus
    this.setupDropdowns();
    
    // Mega menus
    this.setupMegaMenus();
    
    // Tab navigation
    this.setupTabs();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    
    // Close menus on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllMenus();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  /**
   * ========== MOBILE MENU ==========
   */
  
  toggleMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    
    if (!menu) return;
    
    const isOpen = menu.classList.contains('show');
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    
    if (menu) {
      menu.classList.add('show');
      toggle?.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Animate menu items
      const menuItems = menu.querySelectorAll('.mobile-nav-link');
      menuItems.forEach((item, index) => {
        item.style.animation = `slideInUp ${300 + index * 100}ms var(--transition-timing-ease-out) forwards`;
      });
    }
  }

  closeMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    
    if (menu) {
      menu.classList.remove('show');
      toggle?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * ========== SIDEBAR ==========
   */
  
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const isOpen = sidebar.classList.contains('show');
    
    if (isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.add('show');
      
      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: ${parseInt(getComputedStyle(sidebar).zIndex) - 1};
        backdrop-filter: blur(4px);
      `;
      
      backdrop.addEventListener('click', () => this.closeSidebar());
      document.body.appendChild(backdrop);
    }
  }

  closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    
    if (sidebar) {
      sidebar.classList.remove('show');
    }
    
    if (backdrop) {
      backdrop.remove();
    }
  }

  /**
   * ========== DROPDOWN MENUS ==========
   */
  
  setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-link, .dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleDropdown(dropdown);
        });
        
        // Hover effects for desktop
        if (window.innerWidth > 768) {
          dropdown.addEventListener('mouseenter', () => {
            this.showDropdown(dropdown);
          });
          
          dropdown.addEventListener('mouseleave', () => {
            this.hideDropdown(dropdown);
          });
        }
      }
    });
  }

  toggleDropdown(dropdown) {
    const isOpen = dropdown.classList.contains('show');
    
    // Close all other dropdowns
    this.closeAllDropdowns();
    
    if (!isOpen) {
      this.showDropdown(dropdown);
    }
  }

  showDropdown(dropdown) {
    dropdown.classList.add('show');
    this.activeDropdown = dropdown;
    
    // Update arrow direction
    const arrow = dropdown.querySelector('.dropdown-arrow');
    if (arrow) {
      arrow.style.transform = 'rotate(180deg)';
    }
  }

  hideDropdown(dropdown) {
    dropdown.classList.remove('show');
    
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    }
    
    // Reset arrow direction
    const arrow = dropdown.querySelector('.dropdown-arrow');
    if (arrow) {
      arrow.style.transform = 'rotate(0deg)';
    }
  }

  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown.show');
    dropdowns.forEach(dropdown => this.hideDropdown(dropdown));
  }

  /**
   * ========== MEGA MENUS ==========
   */
  
  setupMegaMenus() {
    const megaMenuItems = document.querySelectorAll('.nav-item[data-mega-menu]');
    
    megaMenuItems.forEach(item => {
      const trigger = item.querySelector('.nav-link');
      const menu = item.querySelector('.mega-menu');
      
      if (trigger && menu) {
        // Desktop hover effects
        if (window.innerWidth > 1024) {
          item.addEventListener('mouseenter', () => {
            this.showMegaMenu(item);
          });
          
          item.addEventListener('mouseleave', () => {
            this.hideMegaMenu(item);
          });
        } else {
          // Mobile click effects
          trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMegaMenu(item);
          });
        }
      }
    });
  }

  toggleMegaMenu(item) {
    const isOpen = item.classList.contains('show');
    
    // Close all other mega menus
    this.closeAllMegaMenus();
    
    if (!isOpen) {
      this.showMegaMenu(item);
    }
  }

  showMegaMenu(item) {
    item.classList.add('show');
    this.activeMegaMenu = item;
    
    // Animate menu sections
    const sections = item.querySelectorAll('.mega-menu-section');
    sections.forEach((section, index) => {
      section.style.animation = `fadeIn ${300 + index * 100}ms var(--transition-timing-ease-out) forwards`;
    });
  }

  hideMegaMenu(item) {
    item.classList.remove('show');
    
    if (this.activeMegaMenu === item) {
      this.activeMegaMenu = null;
    }
  }

  closeAllMegaMenus() {
    const megaMenus = document.querySelectorAll('.nav-item.show[data-mega-menu]');
    megaMenus.forEach(item => this.hideMegaMenu(item));
  }

  /**
   * ========== TAB NAVIGATION ==========
   */
  
  setupTabs() {
    const tabContainers = document.querySelectorAll('.tab-navigation');
    
    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.tab-link');
      const contentContainer = container.nextElementSibling;
      
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          this.switchTab(tab, tabs, contentContainer);
        });
      });
    });
  }

  switchTab(activeTab, allTabs, contentContainer) {
    const targetId = activeTab.getAttribute('href').substring(1);
    
    // Update tab states
    allTabs.forEach(tab => tab.classList.remove('active'));
    activeTab.classList.add('active');
    
    // Update content
    if (contentContainer) {
      const contents = contentContainer.querySelectorAll('.tab-content');
      contents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
      });
      
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = 'block';
        targetContent.classList.add('active');
      }
    }
    
    // Update URL hash without scrolling
    if (history.replaceState) {
      history.replaceState(null, null, `#${targetId}`);
    }
  }

  /**
   * ========== SCROLL EFFECTS ==========
   */
  
  setupScrollEffects() {
    const header = document.querySelector('.main-header');
    
    if (header) {
      let ticking = false;
      
      const updateScrollEffects = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for styling changes
        if (scrollTop > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (scrollTop > this.scrollPosition && scrollTop > 100) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
        
        this.scrollPosition = scrollTop;
        ticking = false;
      };
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateScrollEffects);
          ticking = true;
        }
      });
    }
  }

  /**
   * ========== ACTIVE PAGE INDICATORS ==========
   */
  
  setupActivePageIndicators() {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link, .mobile-nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || href === currentPath + currentHash) {
        link.classList.add('active');
        
        // Also mark parent dropdown/mega menu as active
        const parentDropdown = link.closest('.dropdown');
        if (parentDropdown) {
          const parentTrigger = parentDropdown.querySelector('.nav-link');
          if (parentTrigger) {
            parentTrigger.classList.add('active');
          }
        }
      }
    });
    
    // Update breadcrumbs
    this.updateBreadcrumbs();
  }

  updateBreadcrumbs() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    const pathSegments = window.location.pathname.split('/').filter(segment => segment);
    const breadcrumbItems = [];
    
    // Add home
    breadcrumbItems.push(`
      <li class="breadcrumb-item">
        <a href="/" class="breadcrumb-link">Home</a>
      </li>
    `);
    
    // Add path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += '/' + segment;
      const isLast = index === pathSegments.length - 1;
      const segmentTitle = this.formatBreadcrumbTitle(segment);
      
      if (isLast) {
        breadcrumbItems.push(`
          <li class="breadcrumb-item">
            <span class="breadcrumb-current">${segmentTitle}</span>
          </li>
        `);
      } else {
        breadcrumbItems.push(`
          <li class="breadcrumb-item">
            <a href="${currentPath}" class="breadcrumb-link">${segmentTitle}</a>
          </li>
        `);
      }
    });
    
    breadcrumb.innerHTML = breadcrumbItems.join('');
  }

  formatBreadcrumbTitle(segment) {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * ========== KEYBOARD NAVIGATION ==========
   */
  
  setupKeyboardNavigation() {
    // Arrow key navigation for tabs
    const tabContainers = document.querySelectorAll('.tab-navigation');
    
    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.tab-link');
      
      tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
          let targetIndex = -1;
          
          if (e.key === 'ArrowRight') {
            targetIndex = index < tabs.length - 1 ? index + 1 : 0;
          } else if (e.key === 'ArrowLeft') {
            targetIndex = index > 0 ? index - 1 : tabs.length - 1;
          }
          
          if (targetIndex >= 0) {
            e.preventDefault();
            tabs[targetIndex].focus();
            tabs[targetIndex].click();
          }
        });
      });
    });
  }

  /**
   * ========== UTILITY METHODS ==========
   */
  
  handleOutsideClick(e) {
    // Close dropdowns if clicking outside
    if (this.activeDropdown && !this.activeDropdown.contains(e.target)) {
      this.hideDropdown(this.activeDropdown);
    }
    
    // Close mega menus if clicking outside
    if (this.activeMegaMenu && !this.activeMegaMenu.contains(e.target)) {
      this.hideMegaMenu(this.activeMegaMenu);
    }
  }

  handleResize() {
    const isDesktop = window.innerWidth > 1024;
    const isTablet = window.innerWidth > 768;
    
    // Close mobile menu on desktop
    if (isDesktop) {
      this.closeMobileMenu();
    }
    
    // Close sidebar on larger screens if not persistent
    if (isDesktop && !document.querySelector('.sidebar[data-persistent]')) {
      this.closeSidebar();
    }
    
    // Re-setup hover effects based on screen size
    this.setupDropdowns();
    this.setupMegaMenus();
  }

  closeAllMenus() {
    this.closeMobileMenu();
    this.closeSidebar();
    this.closeAllDropdowns();
    this.closeAllMegaMenus();
  }

  /**
   * ========== PUBLIC API ==========
   */
  
  // Method to programmatically activate a tab
  activateTab(tabId) {
    const tab = document.querySelector(`[href="#${tabId}"]`);
    if (tab) {
      tab.click();
    }
  }
  
  // Method to programmatically open/close sidebar
  setSidebarState(open) {
    if (open) {
      this.openSidebar();
    } else {
      this.closeSidebar();
    }
  }
  
  // Method to add notification badge to navigation items
  addNotificationBadge(selector, count) {
    const element = document.querySelector(selector);
    if (element) {
      let badge = element.querySelector('.sidebar-badge, .notification-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'sidebar-badge';
        element.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
  
  // Method to highlight navigation item
  highlightNavItem(selector, duration = 3000) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.animation = `pulse 1s ease-in-out 3`;
      setTimeout(() => {
        element.style.animation = '';
      }, duration);
    }
  }
}

// Initialize the navigation system
const navigationSystem = new NavigationSystem();

// Export for modules
if (typeof window !== 'undefined') {
  window.NavigationSystem = NavigationSystem;
  window.navigationSystem = navigationSystem;
}

/**
 * ========== EXEMPLOS DE USO ==========
 */

/*
// Ativar uma tab programaticamente
navigationSystem.activateTab('profile-tab');

// Controlar sidebar
navigationSystem.setSidebarState(true); // abrir
navigationSystem.setSidebarState(false); // fechar

// Adicionar badge de notificação
navigationSystem.addNotificationBadge('.nav-link[href="/messages"]', 5);

// Destacar item de navegação
navigationSystem.highlightNavItem('.nav-link[href="/dashboard"]');

// Fechar todos os menus
navigationSystem.closeAllMenus();
*/