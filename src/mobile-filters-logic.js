/**
 * Mobile Filters Logic - Логика мобильных фильтров
 * Обеспечивает работу раскрывающихся фильтров на мобильных устройствах
 */

class MobileFiltersManager {
  constructor() {
    this.isOpen = false;
    this.filtersToggle = null;
    this.filtersCollapsible = null;
    this.filtersChip = null;
    this.activeFiltersCount = 0;
    
    // Отслеживаем размер экрана
    this.isMobile = window.innerWidth <= 768;
    
    // Debounce для оптимизации
    this.resizeTimeout = null;
    
    this.init();
  }
  
  init() {
    this.setupElements();
    this.bindEvents();
    this.updateChipText();
    
    // Отслеживаем изменения в фильтрах
    this.observeFilterChanges();
  }
  
  setupElements() {
    this.filtersToggle = document.querySelector('.filters-toggle');
    this.filtersCollapsible = document.getElementById('filters-collapsible');
    this.filtersChip = document.querySelector('.filters-toggle-chip');
    
    // Создаем чип если его нет
    if (!this.filtersChip && this.filtersToggle) {
      this.createFiltersChip();
    }
    
    // Копируем содержимое сайдбара в мобильные фильтры
    this.copyFiltersToMobile();
  }
  
  createFiltersChip() {
    if (!this.filtersToggle) return;
    
    const chip = document.createElement('label');
    chip.className = 'filters-toggle-chip';
    chip.setAttribute('for', this.filtersToggle.id || 'filters-toggle');
    chip.innerHTML = `
      <span>Фильтры</span>
      <span class="active-filters-count" style="display: none;"></span>
    `;
    
    // Вставляем после тоггла
    this.filtersToggle.parentNode.insertBefore(chip, this.filtersToggle.nextSibling);
    this.filtersChip = chip;
  }
  
  copyFiltersToMobile() {
    if (!this.filtersCollapsible) return;
    
    const sidebar = document.getElementById('filters-sidebar');
    if (!sidebar) return;
    
    const filtersPanel = sidebar.querySelector('.filters-panel');
    if (!filtersPanel) return;
    
    // Клонируем панель фильтров
    const clonedPanel = filtersPanel.cloneNode(true);
    this.filtersCollapsible.innerHTML = '';
    this.filtersCollapsible.appendChild(clonedPanel);
    
    // Переназначаем ID для избежания конфликтов
    this.updateMobileFilterIds(clonedPanel);
    
    // Привязываем обработчики к мобильным фильтрам
    this.bindMobileFilterEvents(clonedPanel);
  }
  
  updateMobileFilterIds(panel) {
    // Обновляем ID элементов чтобы избежать конфликтов
    const elementsWithIds = panel.querySelectorAll('[id]');
    elementsWithIds.forEach(el => {
      if (el.id) {
        el.id = 'mobile-' + el.id;
      }
    });
    
    // Обновляем for аттрибуты для label
    const labels = panel.querySelectorAll('label[for]');
    labels.forEach(label => {
      if (label.getAttribute('for')) {
        label.setAttribute('for', 'mobile-' + label.getAttribute('for'));
      }
    });
  }
  
  bindMobileFilterEvents(panel) {
    // Поиск
    const searchInput = panel.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearchChange(e.target.value);
      });
    }
    
    // Очистка фильтров
    const clearBtn = panel.querySelector('.clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
    
    // Чекбоксы фильтров
    const checkboxes = panel.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.handleFilterChange(e.target);
      });
    });
  }
  
  bindEvents() {
    // Обработчик клика по чипу
    if (this.filtersChip) {
      this.filtersChip.addEventListener('click', (e) => {
        if (e.target === this.filtersChip || e.target.parentNode === this.filtersChip) {
          this.toggleFilters();
        }
      });
    }
    
    // Обработчик изменения чекбокса
    if (this.filtersToggle) {
      this.filtersToggle.addEventListener('change', (e) => {
        this.toggleFilters(e.target.checked);
      });
    }
    
    // Обработчик ресайза окна
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100);
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && this.isMobile) {
        this.closeFilters();
      }
    });
    
    // Закрытие по клику вне области
    document.addEventListener('click', (e) => {
      if (this.isOpen && this.isMobile && !this.isClickInsideFilters(e.target)) {
        this.closeFilters();
      }
    });
  }
  
  toggleFilters(forceState = null) {
    if (forceState !== null) {
      this.isOpen = forceState;
    } else {
      this.isOpen = !this.isOpen;
    }
    
    if (this.isOpen) {
      this.openFilters();
    } else {
      this.closeFilters();
    }
  }
  
  openFilters() {
    if (!this.isMobile || !this.filtersCollapsible) return;
    
    this.isOpen = true;
    
    // Обновляем состояние чекбокса
    if (this.filtersToggle) {
      this.filtersToggle.checked = true;
    }
    
    // Добавляем класс и анимацию
    this.filtersCollapsible.classList.add('open');
    
    // Обновляем aria-атрибуты для доступности
    this.filtersCollapsible.setAttribute('aria-hidden', 'false');
    
    // Фокус на первом элементе
    const firstInput = this.filtersCollapsible.querySelector('input, button');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
    
    // Отправляем событие
    document.dispatchEvent(new CustomEvent('mobile-filters:opened'));
  }
  
  closeFilters() {
    if (!this.isMobile || !this.filtersCollapsible) return;
    
    this.isOpen = false;
    
    // Обновляем состояние чекбокса
    if (this.filtersToggle) {
      this.filtersToggle.checked = false;
    }
    
    // Убираем класс
    this.filtersCollapsible.classList.remove('open');
    
    // Обновляем aria-атрибуты
    this.filtersCollapsible.setAttribute('aria-hidden', 'true');
    
    // Отправляем событие
    document.dispatchEvent(new CustomEvent('mobile-filters:closed'));
  }
  
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    // Если перешли с мобильного на десктоп
    if (wasMobile && !this.isMobile && this.isOpen) {
      this.closeFilters();
    }
    
    // Обновляем состояние
    this.updateChipText();
  }
  
  isClickInsideFilters(target) {
    if (!this.filtersCollapsible || !this.filtersChip) return false;
    
    return this.filtersCollapsible.contains(target) || 
           this.filtersChip.contains(target) ||
           (this.filtersToggle && this.filtersToggle.contains(target));
  }
  
  handleSearchChange(value) {
    // Передаем событие в основной каталог
    const desktopSearchInput = document.querySelector('#filters-sidebar .search-input');
    if (desktopSearchInput) {
      desktopSearchInput.value = value;
      desktopSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    this.updateActiveFiltersCount();
  }
  
  handleFilterChange(checkbox) {
    // Находим соответствующий чекбокс в десктопной версии
    const desktopCheckbox = document.querySelector(`#filters-sidebar .filter-checkbox[value="${checkbox.value}"]`);
    if (desktopCheckbox) {
      desktopCheckbox.checked = checkbox.checked;
      desktopCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    this.updateActiveFiltersCount();
  }
  
  clearAllFilters() {
    // Очищаем все чекбоксы в мобильной версии
    const mobileCheckboxes = this.filtersCollapsible.querySelectorAll('.filter-checkbox');
    mobileCheckboxes.forEach(cb => {
      cb.checked = false;
    });
    
    // Очищаем поле поиска
    const mobileSearchInput = this.filtersCollapsible.querySelector('.search-input');
    if (mobileSearchInput) {
      mobileSearchInput.value = '';
    }
    
    // Вызываем очистку в основном каталоге
    if (window.catalog && typeof window.catalog.clearAllFilters === 'function') {
      window.catalog.clearAllFilters();
    }
    
    this.updateActiveFiltersCount();
  }
  
  updateActiveFiltersCount() {
    // Подсчитываем количество активных фильтров
    let count = 0;
    
    if (this.filtersCollapsible) {
      // Чекбоксы
      const checkedBoxes = this.filtersCollapsible.querySelectorAll('.filter-checkbox:checked');
      count += checkedBoxes.length;
      
      // Поиск
      const searchInput = this.filtersCollapsible.querySelector('.search-input');
      if (searchInput && searchInput.value.trim()) {
        count += 1;
      }
    }
    
    this.activeFiltersCount = count;
    this.updateChipText();
  }
  
  updateChipText() {
    if (!this.filtersChip) return;
    
    const countSpan = this.filtersChip.querySelector('.active-filters-count');
    const textSpan = this.filtersChip.querySelector('span:first-child');
    
    if (this.activeFiltersCount > 0) {
      if (countSpan) {
        countSpan.textContent = `(${this.activeFiltersCount})`;
        countSpan.style.display = 'inline';
      }
      if (textSpan) {
        textSpan.textContent = 'Фильтры';
      }
    } else {
      if (countSpan) {
        countSpan.style.display = 'none';
      }
      if (textSpan) {
        textSpan.textContent = 'Фильтры';
      }
    }
  }
  
  observeFilterChanges() {
    // Отслеживаем изменения в десктопной версии фильтров
    const desktopSidebar = document.getElementById('filters-sidebar');
    if (!desktopSidebar) return;
    
    // Отслеживаем изменения через MutationObserver
    const observer = new MutationObserver((mutations) => {
      let hasChanges = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'checked' || 
             mutation.attributeName === 'value')) {
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        this.syncFiltersFromDesktop();
      }
    });
    
    observer.observe(desktopSidebar, {
      attributes: true,
      subtree: true,
      attributeFilter: ['checked', 'value']
    });
    
    // Отслеживаем события input и change
    desktopSidebar.addEventListener('input', () => {
      setTimeout(() => this.syncFiltersFromDesktop(), 50);
    });
    
    desktopSidebar.addEventListener('change', () => {
      setTimeout(() => this.syncFiltersFromDesktop(), 50);
    });
  }
  
  syncFiltersFromDesktop() {
    if (!this.filtersCollapsible) return;
    
    // Синхронизируем поиск
    const desktopSearch = document.querySelector('#filters-sidebar .search-input');
    const mobileSearch = this.filtersCollapsible.querySelector('.search-input');
    if (desktopSearch && mobileSearch && desktopSearch.value !== mobileSearch.value) {
      mobileSearch.value = desktopSearch.value;
    }
    
    // Синхронизируем чекбоксы
    const desktopCheckboxes = document.querySelectorAll('#filters-sidebar .filter-checkbox');
    desktopCheckboxes.forEach(desktopCb => {
      const mobileCb = this.filtersCollapsible.querySelector(`.filter-checkbox[value="${desktopCb.value}"]`);
      if (mobileCb && mobileCb.checked !== desktopCb.checked) {
        mobileCb.checked = desktopCb.checked;
      }
    });
    
    this.updateActiveFiltersCount();
  }
  
  // Публичные методы
  destroy() {
    // Очистка обработчиков событий
    clearTimeout(this.resizeTimeout);
  }
  
  refresh() {
    // Обновление состояния
    this.copyFiltersToMobile();
    this.syncFiltersFromDesktop();
  }
  
  getState() {
    return {
      isOpen: this.isOpen,
      isMobile: this.isMobile,
      activeFiltersCount: this.activeFiltersCount
    };
  }
}

// Инициализация
let mobileFilters = null;

function initMobileFilters() {
  // Инициализируем только после загрузки каталога
  if (typeof window.catalog !== 'undefined' && window.catalog && !mobileFilters) {
    mobileFilters = new MobileFiltersManager();
    
    // Доступ к менеджеру через window
    window.mobileFilters = mobileFilters;
    
    console.log('Mobile filters initialized');
  } else {
    // Повторяем попытку через 100мс
    setTimeout(initMobileFilters, 100);
  }
}

// Авто-инициализация
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMobileFilters, 500); // Даем время на загрузку каталога
  });
} else {
  setTimeout(initMobileFilters, 500);
}

// Переинициализация при обновлении каталога
document.addEventListener('products:rendered', () => {
  if (mobileFilters) {
    setTimeout(() => mobileFilters.refresh(), 100);
  }
});

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
  if (mobileFilters) {
    mobileFilters.destroy();
  }
});

// Экспорт для ES6 модулей
export { MobileFiltersManager, mobileFilters };
export default MobileFiltersManager;