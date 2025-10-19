/**
 * Mail Import Page Logic
 */

class MailImportManager {
  constructor() {
    this.isAuthorized = false;
    this.previewedEmails = [];
    this.init();
  }

  /**
   * Initialize
   */
  async init() {
    // Bind events first
    this.bindEvents();

    // Check authorization status (wait for it to complete)
    await this.checkAuthStatus();

    // Check Gemini migration status
    await this.checkMigrationStatus();

    // Check Image migration status
    await this.checkImageMigrationStatus();

    // Check Author Fields migration status
    await this.checkAuthorFieldsMigrationStatus();

    // Load data stats
    this.loadDataStats();

    // Force show cards if authorized (double check)
    if (this.isAuthorized) {
      console.log('🔄 Double-checking card visibility...');
      setTimeout(() => {
        const previewCard = document.getElementById('previewCard');
        const historyCard = document.getElementById('historyCard');
        const geminiMigrationCard = document.getElementById('geminiMigrationCard');
        const imageMigrationCard = document.getElementById('imageMigrationCard');
        const authorFieldsMigrationCard = document.getElementById('authorFieldsMigrationCard');
        
        // Cards are now visible by default in HTML
        // Just ensure opacity is set for smooth animations
        if (previewCard) {
          previewCard.style.opacity = '1';
          previewCard.style.transform = 'translateY(0)';
        }
        
        if (historyCard) {
          historyCard.style.opacity = '1';
          historyCard.style.transform = 'translateY(0)';
        }

        if (geminiMigrationCard) {
          console.log('✅ Gemini Migration card is visible');
        }

        if (imageMigrationCard) {
          console.log('✅ Image Migration card is visible');
        }

        if (authorFieldsMigrationCard) {
          console.log('✅ Author Fields Migration card is visible');
        }
      }, 500); // Wait 500ms after initialization
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Authorization button
    const btnAuthorize = document.getElementById('btnAuthorize');
    if (btnAuthorize) {
      btnAuthorize.addEventListener('click', () => this.authorize());
    }

    // Preview button
    const btnPreview = document.getElementById('btnPreview');
    if (btnPreview) {
      btnPreview.addEventListener('click', () => this.previewEmails());
    }

    // Import button
    const btnImport = document.getElementById('btnImport');
    if (btnImport) {
      btnImport.addEventListener('click', () => this.importEmails());
    }

    // Refresh history button
    const btnRefreshHistory = document.getElementById('btnRefreshHistory');
    if (btnRefreshHistory) {
      btnRefreshHistory.addEventListener('click', () => this.loadHistory());
    }

    // Initialize categories button
    const btnInitCategories = document.getElementById('btnInitCategories');
    if (btnInitCategories) {
      btnInitCategories.addEventListener('click', () => this.initializeCategories());
    }

    // Gemini migration buttons
    const btnRunMigration = document.getElementById('btnRunMigration');
    if (btnRunMigration) {
      btnRunMigration.addEventListener('click', () => this.runGeminiMigration());
    }

    const btnCheckMigration = document.getElementById('btnCheckMigration');
    if (btnCheckMigration) {
      btnCheckMigration.addEventListener('click', () => this.checkMigrationStatus());
    }

    const btnViewStats = document.getElementById('btnViewStats');
    if (btnViewStats) {
      btnViewStats.addEventListener('click', () => this.toggleStats());
    }

    // Image migration buttons
    const btnRunImageMigration = document.getElementById('btnRunImageMigration');
    if (btnRunImageMigration) {
      btnRunImageMigration.addEventListener('click', () => this.runImageMigration());
    }

    const btnCheckImageMigration = document.getElementById('btnCheckImageMigration');
    if (btnCheckImageMigration) {
      btnCheckImageMigration.addEventListener('click', () => this.checkImageMigrationStatus());
    }

    // Author Fields migration buttons
    const btnRunAuthorFieldsMigration = document.getElementById('btnRunAuthorFieldsMigration');
    if (btnRunAuthorFieldsMigration) {
      btnRunAuthorFieldsMigration.addEventListener('click', () => this.runAuthorFieldsMigration());
    }

    const btnCheckAuthorFieldsMigration = document.getElementById('btnCheckAuthorFieldsMigration');
    if (btnCheckAuthorFieldsMigration) {
      btnCheckAuthorFieldsMigration.addEventListener('click', () => this.checkAuthorFieldsMigrationStatus());
    }

    // Data management buttons
    const btnRefreshDataStats = document.getElementById('btnRefreshDataStats');
    if (btnRefreshDataStats) {
      btnRefreshDataStats.addEventListener('click', () => this.loadDataStats());
    }

    const btnClearAllData = document.getElementById('btnClearAllData');
    if (btnClearAllData) {
      btnClearAllData.addEventListener('click', () => this.clearAllData());
    }

    const btnClearGmailData = document.getElementById('btnClearGmailData');
    if (btnClearGmailData) {
      btnClearGmailData.addEventListener('click', () => this.clearGmailData());
    }
  }

  /**
   * Check authorization status
   */
  async checkAuthStatus() {
    try {
      const response = await window.apiService.request('/mail/status');
      
      if (response.success) {
        this.isAuthorized = response.data.authorized;
        this.updateAuthUI(response.data);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      this.showToast('Unable to check authorization status', 'error');
      this.updateAuthUI({ authorized: false, message: 'Failed to check authorization status' });
    }
  }

  /**
   * Update authorization UI
   */
  updateAuthUI(data) {
    const statusIndicator = document.getElementById('authStatus');
    const authInfo = document.getElementById('authInfo');
    const authActions = document.getElementById('authActions');
    const previewCard = document.getElementById('previewCard');
    const historyCard = document.getElementById('historyCard');

    console.log('📧 Auth Status:', data.authorized ? 'Authorized ✅' : 'Not Authorized ⚠️');

    if (data.authorized) {
      // Authorized
      if (statusIndicator) {
        statusIndicator.innerHTML = `
          <span class="status-dot authorized"></span>
          <span class="status-text">Authorized</span>
        `;
      }
      
      if (authInfo) {
        authInfo.innerHTML = `
          <p><strong>✅ Gmail Authorized</strong></p>
          <p>${data.message}</p>
          <p>You can now preview and import emails to the knowledge base.</p>
        `;
      }
      
      if (authActions) {
        authActions.style.display = 'none';
      }
      
      // Cards are now visible by default, just ensure animations are smooth
      if (previewCard) {
        setTimeout(() => {
          previewCard.style.opacity = '1';
          previewCard.style.transform = 'translateY(0)';
        }, 50);
        console.log('📬 Email Preview card: Ready');
      } else {
        console.error('❌ previewCard element not found!');
      }
      
      if (historyCard) {
        setTimeout(() => {
          historyCard.style.opacity = '1';
          historyCard.style.transform = 'translateY(0)';
        }, 50);
        console.log('📚 Import History card: Ready');
      } else {
        console.error('❌ historyCard element not found!');
      }

      // Auto load history
      this.loadHistory();
    } else {
      // Unauthorized
      if (statusIndicator) {
        statusIndicator.innerHTML = `
          <span class="status-dot unauthorized"></span>
          <span class="status-text">Unauthorized</span>
        `;
      }
      
      if (authInfo) {
        authInfo.innerHTML = `
          <p><strong>⚠️ Gmail Not Authorized</strong></p>
          <p>${data.message}</p>
          <p>Please click the button below to authorize Gmail access.</p>
        `;
      }
      
      if (authActions) {
        authActions.style.display = 'block';
      }
      
      // Keep cards visible even when not authorized (for better UX)
      // Users can see what features are available
      if (previewCard) {
        console.log('📬 Email Preview card: VISIBLE (but disabled until authorized)');
      }
      
      if (historyCard) {
        console.log('📚 Import History card: VISIBLE (but disabled until authorized)');
      }
      
      // Hide troubleshooting card when not authorized
      const troubleshootingCard = document.getElementById('troubleshootingCard');
      if (troubleshootingCard) {
        troubleshootingCard.style.display = 'none';
      }
    }
    
    // Always show troubleshooting card if authorized
    if (data.authorized) {
      const troubleshootingCard = document.getElementById('troubleshootingCard');
      if (troubleshootingCard) {
        troubleshootingCard.style.display = 'block';
      }
    }
  }

  /**
   * Authorize Gmail
   */
  async authorize() {
    try {
      const response = await window.apiService.request('/mail/auth-url');
      
      if (response.success && response.data.authUrl) {
        this.showToast('Redirecting to authorization page...', 'info');
        
        // Open authorization page
        setTimeout(() => {
          window.open(response.data.authUrl, '_blank');
        }, 500);

        // Remind user to refresh after authorization
        this.showToast('Please refresh this page after authorization', 'info', 5000);
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      this.showToast('Failed to get authorization link', 'error');
    }
  }

  /**
   * Preview emails
   */
  async previewEmails() {
    // Safely get element values to avoid null errors
    const previewCountEl = document.getElementById('previewCount');
    const previewCount = previewCountEl ? previewCountEl.value : 10;
    
    const categoryFilterEl = document.getElementById('categoryFilter');
    const categoryFilter = categoryFilterEl ? categoryFilterEl.value : '';
    
    const filterSpamEl = document.getElementById('filterSpam');
    const filterSpam = filterSpamEl ? filterSpamEl.checked : true;

    const previewLoading = document.getElementById('previewLoading');
    const previewEmpty = document.getElementById('previewEmpty');
    const previewList = document.getElementById('previewList');
    const importActions = document.getElementById('importActions');

    // Show loading state
    previewLoading.style.display = 'flex';
    previewEmpty.style.display = 'none';
    previewList.innerHTML = '';
    importActions.style.display = 'none';

    try {
      // Build search query
      let searchQuery = '';
      
      // If "Newsletter" is selected, add related keywords
      if (categoryFilter === 'newsletter') {
        searchQuery = 'subject:(newsletter OR digest OR weekly OR daily OR update OR news)';
      }

      const url = `/mail/preview?maxResults=${previewCount}&query=${encodeURIComponent(searchQuery)}&filterSpam=${filterSpam}`;
      const response = await window.apiService.request(url);

      previewLoading.style.display = 'none';

      if (response.success && response.data.emails.length > 0) {
        let emails = response.data.emails;
        
        // Additional frontend filtering (based on selected category)
        if (categoryFilter && categoryFilter !== 'newsletter') {
          emails = emails.filter(email => 
            email.suggestedCategory === categoryFilter
          );
        } else if (categoryFilter === 'newsletter') {
          emails = emails.filter(email => email.isNewsletter);
        }

        this.previewedEmails = emails;
        
        if (emails.length > 0) {
          this.renderEmailList(emails);
          importActions.style.display = 'flex';
          
          let message = `Loaded ${emails.length} new emails`;
          const filterParts = [];
          if (response.data.filtered > 0) {
            filterParts.push(`${response.data.filtered} spam`);
          }
          if (response.data.alreadyImported > 0) {
            filterParts.push(`${response.data.alreadyImported} already imported`);
          }
          if (filterParts.length > 0) {
            message += ` (filtered: ${filterParts.join(', ')})`;
          }
          this.showToast(message, 'success');
        } else {
          previewEmpty.style.display = 'flex';
          const filterParts = [];
          if (response.data && response.data.filtered > 0) {
            filterParts.push(`${response.data.filtered} spam`);
          }
          if (response.data && response.data.alreadyImported > 0) {
            filterParts.push(`${response.data.alreadyImported} already imported`);
          }
          let message = 'No new emails to import';
          if (filterParts.length > 0) {
            message += ` (filtered: ${filterParts.join(', ')})`;
          }
          this.showToast(message, 'info');
        }
      } else {
        previewEmpty.style.display = 'flex';
        const filterParts = [];
        if (response.data && response.data.filtered > 0) {
          filterParts.push(`${response.data.filtered} spam`);
        }
        if (response.data && response.data.alreadyImported > 0) {
          filterParts.push(`${response.data.alreadyImported} already imported`);
        }
        let message = 'No new emails found';
        if (filterParts.length > 0) {
          message += ` (filtered: ${filterParts.join(', ')})`;
        }
        this.showToast(message, 'info');
      }
    } catch (error) {
      console.error('Failed to preview emails:', error);
      previewLoading.style.display = 'none';
      previewEmpty.style.display = 'flex';
      this.showToast('Failed to preview emails', 'error');
    }
  }

  /**
   * Render email list
   */
  renderEmailList(emails) {
    const previewList = document.getElementById('previewList');
    previewList.innerHTML = '';

    emails.forEach(email => {
      const emailItem = document.createElement('div');
      emailItem.className = 'email-item';
      
      // Format category name
      const categoryName = this.formatCategoryName(email.suggestedCategory);
      const categoryIcon = email.isNewsletter ? '📰' : '💼';
      
      emailItem.innerHTML = `
        <div class="email-header">
          <div>
            <h3 class="email-title">${this.escapeHtml(email.title)}</h3>
            <p class="email-from">From: ${this.escapeHtml(email.from)}</p>
          </div>
          <div class="email-date">${this.formatDate(email.date)}</div>
        </div>
        <p class="email-snippet">${this.escapeHtml(email.snippet)}</p>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
          <span class="email-category">${categoryIcon} ${categoryName}</span>
          ${email.isNewsletter ? '<span class="email-category newsletter-badge">📰 Newsletter</span>' : ''}
        </div>
      `;
      previewList.appendChild(emailItem);
    });
  }
  
  /**
   * Format category name
   */
  formatCategoryName(slug) {
    const categoryMap = {
      'web-development': 'Web Development',
      'ai-machine-learning': 'AI & Machine Learning',
      'devops': 'DevOps',
      'security': 'Security',
      'data-science': 'Data Science',
      'mobile-development': 'Mobile Development',
      'cloud-computing': 'Cloud Computing',
      'gaming': 'Gaming',
      'photography': 'Photography',
      'music': 'Music',
      'reading': 'Reading',
      'travel': 'Travel',
      'cooking': 'Cooking',
      'sports': 'Sports',
      'art': 'Art',
    };
    return categoryMap[slug] || slug;
  }

  /**
   * Import emails
   */
  async importEmails() {
    const btnImport = document.getElementById('btnImport');
    
    // Safely get element values to avoid null errors
    const previewCountEl = document.getElementById('previewCount');
    const previewCount = previewCountEl ? previewCountEl.value : 10;
    
    const categoryFilterEl = document.getElementById('categoryFilter');
    const categoryFilter = categoryFilterEl ? categoryFilterEl.value : '';
    
    const filterSpamEl = document.getElementById('filterSpam');
    const filterSpam = filterSpamEl ? filterSpamEl.checked : true;

    // Check if AI processing is enabled
    const enableAIEl = document.getElementById('enableAI');
    const enableAI = enableAIEl ? enableAIEl.checked : false;

    // Disable button
    btnImport.disabled = true;
    btnImport.innerHTML = `
      <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
      Importing...
    `;

    try {
      // Build search query based on category filter
      let searchQuery = '';
      
      // If "Newsletter" is selected, add related keywords
      if (categoryFilter === 'newsletter') {
        searchQuery = 'subject:(newsletter OR digest OR weekly OR daily OR update OR news)';
      }

      const response = await window.apiService.request('/mail/import', {
        method: 'POST',
        body: JSON.stringify({
          maxResults: parseInt(previewCount),
          query: searchQuery,
          filterSpam: filterSpam,
        }),
      });

      if (response.success) {
        const { imported, skipped, failed, importedIds } = response.data;
        
        // Show import result
        this.showToast(
          `Successfully imported ${imported} emails (skipped ${skipped}, failed ${failed})`,
          'success',
          3000
        );

        // If AI processing is enabled and we have imported items, process them
        if (enableAI && imported > 0 && importedIds && importedIds.length > 0) {
          this.showToast('Starting AI processing...', 'info', 2000);
          await this.processWithAI(importedIds);
        }

        // Refresh history
        this.loadHistory();

        // Clear preview
        document.getElementById('previewList').innerHTML = '';
        document.getElementById('importActions').style.display = 'none';
        document.getElementById('previewEmpty').style.display = 'flex';
      }
    } catch (error) {
      console.error('Failed to import emails:', error);
      this.showToast('Failed to import emails', 'error');
    } finally {
      // Restore button
      btnImport.disabled = false;
      btnImport.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Import to Knowledge Base
      `;
    }
  }

  /**
   * Process imported items with AI
   */
  async processWithAI(knowledgeIds) {
    const progressSection = document.getElementById('aiProcessingProgress');
    const progressBar = document.getElementById('aiProgressBar');
    const processedCount = document.getElementById('aiProcessedCount');
    const successCount = document.getElementById('aiSuccessCount');
    const skippedCount = document.getElementById('aiSkippedCount');
    const failedCount = document.getElementById('aiFailedCount');
    const currentProcessing = document.getElementById('aiCurrentProcessing');

    // Show progress section
    progressSection.style.display = 'block';

    // Reset counters
    let processed = 0;
    let success = 0;
    let skipped = 0;
    let failed = 0;
    const total = knowledgeIds.length;

    try {
      // Process each item sequentially to avoid API rate limits
      for (let i = 0; i < knowledgeIds.length; i++) {
        const id = knowledgeIds[i];
        
        // Update current processing message
        currentProcessing.textContent = `Processing item ${i + 1} of ${total}...`;

        try {
          // Call AI processing API
          const result = await window.apiService.processMailWithAI(id);
          
          if (result.success) {
            if (result.status === 'completed') {
              success++;
            } else if (result.status === 'skipped') {
              skipped++;
            }
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Failed to process item ${id}:`, error);
          failed++;
        }

        // Update counters
        processed++;
        processedCount.textContent = processed;
        successCount.textContent = success;
        skippedCount.textContent = skipped;
        failedCount.textContent = failed;

        // Update progress bar
        const percent = (processed / total) * 100;
        progressBar.style.width = percent + '%';

        // Add delay to avoid rate limiting (1 second between requests)
        if (i < knowledgeIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Show completion message
      currentProcessing.textContent = `✅ Processing complete! ${success} successful, ${skipped} skipped, ${failed} failed.`;
      
      this.showToast(
        `AI processing complete: ${success} successful, ${skipped} skipped, ${failed} failed`,
        success > 0 ? 'success' : 'warning',
        5000
      );

    } catch (error) {
      console.error('AI processing error:', error);
      currentProcessing.textContent = '❌ Processing failed';
      this.showToast('AI processing failed', 'error');
    }
  }

  /**
   * Load history
   */
  async loadHistory() {
    const historyLoading = document.getElementById('historyLoading');
    const historyEmpty = document.getElementById('historyEmpty');
    const historyList = document.getElementById('historyList');

    historyLoading.style.display = 'flex';
    historyEmpty.style.display = 'none';
    historyList.innerHTML = '';

    try {
      // Call API to get Gmail import history
      const response = await window.apiService.request('/mail/history?limit=20');

      historyLoading.style.display = 'none';

      if (response.success && response.data.items && response.data.items.length > 0) {
        this.renderHistoryList(response.data.items);
        
        // Show total count if available
        if (response.data.pagination && response.data.pagination.total > 0) {
          const total = response.data.pagination.total;
          const shown = response.data.items.length;
          console.log(`Showing ${shown} of ${total} Gmail imports`);
        }
      } else {
        historyEmpty.style.display = 'flex';
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      historyLoading.style.display = 'none';
      historyEmpty.style.display = 'flex';
      this.showToast('Failed to load history', 'error');
    }
  }

  /**
   * Render history list
   */
  renderHistoryList(items) {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');

    historyList.innerHTML = '';
    historyEmpty.style.display = 'none';

    items.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      // Format category display
      const categoryIcon = item.category_icon || '📁';
      const categoryName = item.category_name || 'Uncategorized';
      
      // Extract snippet from content (first 100 chars)
      const snippet = item.content ? 
        (item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content) : 
        'No content';
      
      historyItem.innerHTML = `
        <div class="history-header">
          <div class="history-date">${this.formatDate(item.created_at)}</div>
          <span class="history-category">${categoryIcon} ${this.escapeHtml(categoryName)}</span>
        </div>
        <div class="history-content">
          <h4 class="history-title">${this.escapeHtml(item.title)}</h4>
          <p class="history-source">${this.escapeHtml(item.source)}</p>
          <p class="history-snippet">${this.escapeHtml(snippet)}</p>
        </div>
      `;
      historyList.appendChild(historyItem);
    });
  }

  /**
   * Initialize categories (fix for import failures)
   */
  async initializeCategories() {
    const btnInitCategories = document.getElementById('btnInitCategories');
    
    if (btnInitCategories) {
      btnInitCategories.disabled = true;
      btnInitCategories.innerHTML = `
        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Initializing...
      `;
    }

    try {
      const response = await window.apiService.request('/mail/init-categories', {
        method: 'POST',
      });

      if (response.success) {
        this.showToast(response.message || 'Categories initialized successfully', 'success', 5000);
      }
    } catch (error) {
      console.error('Failed to initialize categories:', error);
      this.showToast('Failed to initialize categories', 'error');
    } finally {
      if (btnInitCategories) {
        btnInitCategories.disabled = false;
        btnInitCategories.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-width="2"/>
            <polyline points="17 21 17 13 7 13 7 21" stroke-width="2"/>
            <polyline points="7 3 7 8 15 8" stroke-width="2"/>
          </svg>
          Initialize Categories
        `;
      }
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  }

  /**
   * HTML escape
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================
  // Gemini AI Migration Methods
  // ==========================================

  /**
   * Check Gemini migration status
   */
  async checkMigrationStatus() {
    console.log('🔍 Starting migration status check...');
    // 调用新的 Gemini 迁移状态检查方法
    await this.checkGeminiMigrationStatus();
  }

  /**
   * Run Gemini database migration (legacy method - calls new implementation)
   */
  async runGeminiMigration() {
    // 调用新实现的 Gemini 迁移方法
    await this.executeGeminiMigration();
  }

  /**
   * Toggle statistics display
   */
  async toggleStats() {
    const migrationStats = document.getElementById('migrationStats');
    const statsContent = document.getElementById('statsContent');
    const btnViewStats = document.getElementById('btnViewStats');

    if (migrationStats.style.display === 'none') {
      // Show stats - load data first
      if (btnViewStats) {
        btnViewStats.disabled = true;
        btnViewStats.innerHTML = `
          <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
          Loading...
        `;
      }

      try {
        const response = await window.apiService.request('/database/stats');

        if (response.success) {
          const { itemStats, logStats } = response.data;
          
          // Render stats
          let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">';
          
          // Item stats
          if (itemStats && itemStats.length > 0) {
            html += '<div>';
            html += '<h5 style="margin-bottom: 0.5rem;">📊 Items by Status</h5>';
            itemStats.forEach(stat => {
              html += `
                <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(102, 126, 234, 0.1); border-radius: 0.25rem;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>${stat.processing_status || 'unknown'}</span>
                    <strong>${stat.total_count}</strong>
                  </div>
                  ${stat.avg_confidence ? `<small style="color: #9ca3af;">Avg confidence: ${(parseFloat(stat.avg_confidence) * 100).toFixed(1)}%</small>` : ''}
                </div>
              `;
            });
            html += '</div>';
          }
          
          // Log stats
          if (logStats && logStats.length > 0) {
            html += '<div>';
            html += '<h5 style="margin-bottom: 0.5rem;">📈 Processing Logs</h5>';
            logStats.forEach(stat => {
              html += `
                <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: rgba(102, 126, 234, 0.1); border-radius: 0.25rem;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>${stat.stage} (${stat.status})</span>
                    <strong>${stat.requests}</strong>
                  </div>
                  <small style="color: #9ca3af;">
                    Tokens: ${stat.input_tokens || 0} in / ${stat.output_tokens || 0} out
                    ${stat.avg_duration ? ` | Avg: ${Math.round(stat.avg_duration)}ms` : ''}
                  </small>
                </div>
              `;
            });
            html += '</div>';
          }
          
          html += '</div>';
          
          if (itemStats.length === 0 && logStats.length === 0) {
            html = '<p style="color: #9ca3af; text-align: center;">No processing data available yet.</p>';
          }
          
          statsContent.innerHTML = html;
          migrationStats.style.display = 'block';
          
          if (btnViewStats) {
            btnViewStats.innerHTML = `
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Hide Statistics
            `;
          }
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        this.showToast('Failed to load statistics', 'error');
      } finally {
        if (btnViewStats) {
          btnViewStats.disabled = false;
        }
      }
    } else {
      // Hide stats
      migrationStats.style.display = 'none';
      if (btnViewStats) {
        btnViewStats.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
            <path d="M3 9h18M9 21V9" stroke-width="2"/>
          </svg>
          View Statistics
        `;
      }
    }
  }

  /**
   * Check Image Migration Status
   */
  async checkImageMigrationStatus() {
    const imageMigrationCard = document.getElementById('imageMigrationCard');
    const imageMigrationStatus = document.getElementById('imageMigrationStatus');
    const imageMigrationStatusText = document.getElementById('imageMigrationStatusText');
    const btnRunImageMigration = document.getElementById('btnRunImageMigration');

    try {
      const response = await window.apiService.request('/database/migration-status-images');

      if (response.success) {
        const { migrated, imagesFieldExists, featuredImageFieldExists, details } = response.data;

        // Card is visible by default
        if (migrated) {
          // Migration completed
          imageMigrationStatus.innerHTML = `
            <span class="status-dot" style="background: #10b981;"></span>
            <span class="status-text">Enabled</span>
          `;
          if (imageMigrationStatusText) {
            imageMigrationStatusText.textContent = details.message;
          }
          if (btnRunImageMigration) {
            btnRunImageMigration.style.display = 'none';
          }
        } else {
          // Migration needed
          imageMigrationStatus.innerHTML = `
            <span class="status-dot" style="background: #fbbf24;"></span>
            <span class="status-text">Not Enabled</span>
          `;
          if (imageMigrationStatusText) {
            imageMigrationStatusText.textContent = details.message;
          }
          if (btnRunImageMigration) {
            btnRunImageMigration.style.display = 'inline-flex';
          }
        }
      }
    } catch (error) {
      console.error('Failed to check image migration status:', error);
      
      // Card is visible by default, just update status
      if (imageMigrationStatus) {
        imageMigrationStatus.innerHTML = `
          <span class="status-dot" style="background: #ef4444;"></span>
          <span class="status-text">Error</span>
        `;
      }
      if (imageMigrationStatusText) {
        imageMigrationStatusText.textContent = 'Failed to check status. Please try again.';
      }
    }
  }

  /**
   * Run Image Migration
   */
  async runImageMigration() {
    const btnRunImageMigration = document.getElementById('btnRunImageMigration');
    
    if (!confirm('Are you sure you want to enable Image Support? This will add new fields to the database.')) {
      return;
    }

    if (btnRunImageMigration) {
      btnRunImageMigration.disabled = true;
      btnRunImageMigration.innerHTML = `
        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Enabling...
      `;
    }

    try {
      const response = await window.apiService.request('/database/migrate-images', {
        method: 'POST',
      });

      if (response.success) {
        this.showToast('✅ Image support enabled successfully!', 'success');
        // Refresh status
        await this.checkImageMigrationStatus();
      } else {
        this.showToast(`❌ Migration failed: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to run image migration:', error);
      this.showToast('❌ Failed to enable image support. Please try again.', 'error');
    } finally {
      if (btnRunImageMigration) {
        btnRunImageMigration.disabled = false;
        btnRunImageMigration.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke-width="2"/>
            <path d="m21 15-5-5L5 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Enable Image Support
        `;
      }
    }
  }

  /**
   * Check Author Fields Migration Status
   */
  async checkAuthorFieldsMigrationStatus() {
    const authorFieldsMigrationCard = document.getElementById('authorFieldsMigrationCard');
    const authorFieldsMigrationStatus = document.getElementById('authorFieldsMigrationStatus');
    const authorFieldsMigrationStatusText = document.getElementById('authorFieldsMigrationStatusText');
    const btnRunAuthorFieldsMigration = document.getElementById('btnRunAuthorFieldsMigration');

    // Card is visible by default in HTML
    try {
      const response = await window.apiService.request('/database/migration-status-author-fields');

      if (response.success) {
        const { migrated, authorNameExists, authorEmailExists, publishedAtExists, details } = response.data;

        if (migrated) {
          // Migration completed
          authorFieldsMigrationStatus.innerHTML = `
            <span class="status-dot" style="background: #10b981;"></span>
            <span class="status-text">Enabled</span>
          `;
          if (authorFieldsMigrationStatusText) {
            authorFieldsMigrationStatusText.textContent = details.message;
          }
          if (btnRunAuthorFieldsMigration) {
            btnRunAuthorFieldsMigration.style.display = 'none';
          }
        } else {
          // Migration needed
          authorFieldsMigrationStatus.innerHTML = `
            <span class="status-dot" style="background: #fbbf24;"></span>
            <span class="status-text">Not Enabled</span>
          `;
          if (authorFieldsMigrationStatusText) {
            authorFieldsMigrationStatusText.textContent = details.message;
          }
          if (btnRunAuthorFieldsMigration) {
            btnRunAuthorFieldsMigration.style.display = 'inline-flex';
          }
        }
      }
    } catch (error) {
      console.error('Failed to check author fields migration status:', error);

      if (authorFieldsMigrationStatus) {
        authorFieldsMigrationStatus.innerHTML = `
          <span class="status-dot" style="background: #ef4444;"></span>
          <span class="status-text">Error</span>
        `;
      }
      if (authorFieldsMigrationStatusText) {
        authorFieldsMigrationStatusText.textContent = 'Failed to check status. Please try again.';
      }
    }
  }

  /**
   * Run Author Fields Migration
   */
  async runAuthorFieldsMigration() {
    const btnRunAuthorFieldsMigration = document.getElementById('btnRunAuthorFieldsMigration');
    
    if (!confirm('Are you sure you want to enable Author Fields? This will add new fields to the database (author_name, author_email, published_at).')) {
      return;
    }

    if (btnRunAuthorFieldsMigration) {
      btnRunAuthorFieldsMigration.disabled = true;
      btnRunAuthorFieldsMigration.innerHTML = `
        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Enabling...
      `;
    }

    try {
      const response = await window.apiService.request('/database/migrate-author-fields', {
        method: 'POST',
      });

      if (response.success) {
        this.showToast('✅ Author fields enabled successfully!', 'success');
        // Refresh status
        await this.checkAuthorFieldsMigrationStatus();
      } else {
        this.showToast(`❌ Migration failed: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to run author fields migration:', error);
      this.showToast('❌ Failed to enable author fields. Please try again.', 'error');
    } finally {
      if (btnRunAuthorFieldsMigration) {
        btnRunAuthorFieldsMigration.disabled = false;
        btnRunAuthorFieldsMigration.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke-width="2"/>
          </svg>
          Enable Author Fields
        `;
      }
    }
  }

  /**
   * Load Data Stats
   */
  async loadDataStats() {
    const dataManagementCard = document.getElementById('dataManagementCard');
    const statTotalItems = document.getElementById('statTotalItems');
    const statGmailItems = document.getElementById('statGmailItems');
    const statPendingItems = document.getElementById('statPendingItems');
    const statProcessingLogs = document.getElementById('statProcessingLogs');

    try {
      const response = await window.apiService.request('/database/data-stats');

      if (response.success) {
        const { knowledgeCount, logCount, gmailCount, pendingCount } = response.data;

        // Show the card
        if (dataManagementCard) {
          dataManagementCard.style.display = 'block';
        }

        // Update stats
        if (statTotalItems) statTotalItems.textContent = knowledgeCount;
        if (statGmailItems) statGmailItems.textContent = gmailCount;
        if (statPendingItems) statPendingItems.textContent = pendingCount;
        if (statProcessingLogs) statProcessingLogs.textContent = logCount;
      }
    } catch (error) {
      console.error('Failed to load data stats:', error);
      
      // Show card even on error
      if (dataManagementCard) {
        dataManagementCard.style.display = 'block';
      }
      
      if (statTotalItems) statTotalItems.textContent = 'Error';
      if (statGmailItems) statGmailItems.textContent = 'Error';
      if (statPendingItems) statPendingItems.textContent = 'Error';
      if (statProcessingLogs) statProcessingLogs.textContent = 'Error';
    }
  }

  /**
   * Clear All Data
   */
  async clearAllData() {
    // Double confirmation
    const firstConfirm = confirm(
      '⚠️ WARNING: This will delete ALL knowledge items and processing logs!\n\n' +
      'This action CANNOT be undone.\n\n' +
      'Are you sure you want to continue?'
    );

    if (!firstConfirm) return;

    const secondConfirm = confirm(
      '⚠️ FINAL WARNING!\n\n' +
      'This is your last chance to cancel.\n\n' +
      'Click OK to permanently delete all data.'
    );

    if (!secondConfirm) return;

    const btnClearAllData = document.getElementById('btnClearAllData');

    if (btnClearAllData) {
      btnClearAllData.disabled = true;
      btnClearAllData.innerHTML = `
        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Clearing...
      `;
    }

    try {
      const response = await window.apiService.request('/database/clear-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clearLogs: true,
          clearKnowledge: true,
          resetSequence: true
        })
      });

      if (response.success) {
        const { stats } = response.data;
        this.showToast(
          `✅ Successfully cleared ${stats.knowledgeCleared} items and ${stats.logsCleared} logs!`,
          'success'
        );
        
        // Refresh stats
        await this.loadDataStats();
      } else {
        this.showToast(`❌ Clear failed: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to clear all data:', error);
      this.showToast('❌ Failed to clear data. Please try again.', 'error');
    } finally {
      if (btnClearAllData) {
        btnClearAllData.disabled = false;
        btnClearAllData.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="10" y1="11" x2="10" y2="17" stroke-width="2" stroke-linecap="round"/>
            <line x1="14" y1="11" x2="14" y2="17" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Clear All Data
        `;
      }
    }
  }

  /**
   * Clear Gmail Data Only
   */
  async clearGmailData() {
    const confirm1 = confirm(
      '⚠️ This will delete all Gmail-imported items and their processing logs.\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirm1) return;

    const btnClearGmailData = document.getElementById('btnClearGmailData');

    if (btnClearGmailData) {
      btnClearGmailData.disabled = true;
      btnClearGmailData.innerHTML = `
        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Clearing...
      `;
    }

    try {
      const response = await window.apiService.request('/database/clear-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clearLogs: true,
          clearKnowledge: true,
          resetSequence: false,
          sourceType: 'gmail'
        })
      });

      if (response.success) {
        const { stats } = response.data;
        this.showToast(
          `✅ Successfully cleared ${stats.knowledgeCleared} Gmail items!`,
          'success'
        );
        
        // Refresh stats
        await this.loadDataStats();
      } else {
        this.showToast(`❌ Clear failed: ${response.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to clear Gmail data:', error);
      this.showToast('❌ Failed to clear Gmail data. Please try again.', 'error');
    } finally {
      if (btnClearGmailData) {
        btnClearGmailData.disabled = false;
        btnClearGmailData.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke-width="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Clear Gmail Only
        `;
      }
    }
  }

  // ============================================
  // Gemini Migration Methods
  // ============================================

  /**
   * 检查 Gemini 迁移状态
   */
  async checkGeminiMigrationStatus() {
    const statusIndicator = document.getElementById('migrationStatus');
    const statusText = document.getElementById('migrationStatusText');
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusTextInHeader = statusIndicator?.querySelector('.status-text'); // 右上角的状态文本
    const btnRun = document.getElementById('btnRunMigration');
    const statsContainer = document.getElementById('migrationStats');
    
    console.log('🔍 Checking Gemini migration status...');
    console.log('Elements found:', {
      statusIndicator: !!statusIndicator,
      statusText: !!statusText,
      statusTextInHeader: !!statusTextInHeader,
      statusDot: !!statusDot,
      btnRun: !!btnRun,
      statsContainer: !!statsContainer
    });
    
    try {
      
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator status-checking';
      }
      if (statusDot) {
        statusDot.className = 'status-dot checking';
      }
      if (statusText) {
        statusText.textContent = 'Checking...';
      }
      if (statusTextInHeader) {
        statusTextInHeader.textContent = 'Checking...';
      }
      
      const response = await window.apiService.checkGeminiMigrationStatus();
      
      console.log('🔍 Migration status response:', response);
      
      if (response.success && response.data) {
        const { migrated, details } = response.data;
        console.log('📊 Migration details:', { migrated, details });
        
        if (migrated) {
          // 已迁移
          console.log('✅ Migration completed, updating UI...');
          console.log('Elements to update:', {
            statusIndicator: !!statusIndicator,
            statusDot: !!statusDot,
            statusText: !!statusText,
            statusTextInHeader: !!statusTextInHeader,
            btnRun: !!btnRun
          });
          
          if (statusIndicator) {
            statusIndicator.className = 'status-indicator status-success';
            console.log('✅ Updated statusIndicator class');
          }
          if (statusDot) {
            statusDot.className = 'status-dot authorized';
            console.log('✅ Updated statusDot class');
          }
          if (statusTextInHeader) {
            statusTextInHeader.textContent = 'Enabled';
            console.log('✅ Updated statusTextInHeader content');
          }
          if (statusText) {
            statusText.innerHTML = `
              ✅ Migration completed
              <br>
              <small style="color: #9ca3af;">
                ${details.geminiFieldsCount}/13 fields | 
                Logs table: ${details.logsTableExists ? '✓' : '✗'}
              </small>
            `;
            console.log('✅ Updated statusText content');
          }
          if (btnRun) {
            btnRun.style.display = 'none';
            console.log('✅ Hidden btnRun button');
          }
          
          // 获取并显示统计信息
          this.loadMigrationStats();
        } else {
          // 未迁移
          if (statusIndicator) {
            statusIndicator.className = 'status-indicator status-warning';
          }
          if (statusDot) {
            statusDot.className = 'status-dot unauthorized';
          }
          if (statusTextInHeader) {
            statusTextInHeader.textContent = 'Not Enabled';
          }
          if (statusText) {
            statusText.innerHTML = `
              ⚠️ Migration required
              <br>
              <small style="color: #9ca3af;">
                ${details.geminiFieldsCount}/13 fields installed
              </small>
            `;
          }
          if (btnRun) {
            btnRun.style.display = 'inline-flex';
          }
          if (statsContainer) {
            statsContainer.style.display = 'none';
          }
        }
      } else {
        console.error('❌ API response failed:', response);
        if (statusIndicator) {
          statusIndicator.className = 'status-indicator status-error';
        }
        if (statusDot) {
          statusDot.className = 'status-dot unauthorized';
        }
        if (statusTextInHeader) {
          statusTextInHeader.textContent = 'Error';
        }
        if (statusText) {
          statusText.textContent = '❌ API response failed';
        }
      }
    } catch (error) {
      console.error('❌ Failed to check migration status:', error);
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator status-error';
      }
      if (statusDot) {
        statusDot.className = 'status-dot unauthorized';
      }
      if (statusTextInHeader) {
        statusTextInHeader.textContent = 'Error';
      }
      if (statusText) {
        statusText.textContent = '❌ Failed to check status';
      }
    }
  }

  /**
   * 执行 Gemini 迁移
   */
  async executeGeminiMigration() {
    const btn = document.getElementById('btnRunMigration');
    const statusIndicator = document.getElementById('migrationStatus');
    const statusText = document.getElementById('migrationStatusText');
    const statusDot = statusIndicator?.querySelector('.status-dot');
    const statusTextInHeader = statusIndicator?.querySelector('.status-text'); // 右上角的状态文本
    
    // 确认对话框
    if (!confirm('Are you sure you want to run the Gemini AI database migration?\n\nThis will add new fields to the knowledge_items table.')) {
      return;
    }
    
    try {
      console.log('🚀 Starting Gemini migration...');
      
      // 更新 UI 状态
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Migrating...';
      }
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator status-checking';
      }
      if (statusDot) {
        statusDot.className = 'status-dot checking';
      }
      if (statusTextInHeader) {
        statusTextInHeader.textContent = 'Migrating...';
      }
      if (statusText) {
        statusText.textContent = 'Running migration...';
      }
      
      // 调用迁移 API
      const response = await window.apiService.runGeminiMigration();
      
      if (response.success) {
        // 迁移成功
        console.log('✅ Migration completed:', response.data);
        
        if (statusIndicator) {
          statusIndicator.className = 'status-indicator status-success';
        }
        if (statusDot) {
          statusDot.className = 'status-dot authorized';
        }
        if (statusTextInHeader) {
          statusTextInHeader.textContent = 'Enabled';
        }
        if (statusText) {
          statusText.innerHTML = `
            ✅ Migration completed successfully!
            <br>
            <small style="color: #9ca3af;">${response.data.details || ''}</small>
          `;
        }
        
        // 显示成功提示
        this.showToast(
          '✅ Gemini AI migration completed successfully!',
          'success',
          5000
        );
        
        // 隐藏迁移按钮
        if (btn) {
          btn.style.display = 'none';
        }
        
        // 重新检查状态并加载统计
        setTimeout(() => {
          this.checkGeminiMigrationStatus();
        }, 1000);
        
      } else {
        throw new Error(response.message || 'Migration failed');
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      
      if (statusIndicator) {
        statusIndicator.className = 'status-indicator status-error';
      }
      if (statusDot) {
        statusDot.className = 'status-dot unauthorized';
      }
      if (statusTextInHeader) {
        statusTextInHeader.textContent = 'Error';
      }
      if (statusText) {
        statusText.textContent = '❌ Migration failed';
      }
      
      // 显示错误提示
      this.showToast(
        `❌ Migration failed: ${error.message}`,
        'error',
        8000
      );
      
      // 恢复按钮
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 11 12 14 22 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Enable Gemini AI
        `;
      }
    }
  }

  /**
   * 加载迁移统计信息
   */
  async loadMigrationStats() {
    const statsContainer = document.getElementById('migrationStats');
    console.log('📊 Loading migration stats, container found:', !!statsContainer);
    
    try {
      const response = await window.apiService.getDatabaseStats();
      console.log('📊 Database stats response:', response);
      
      if (response.success && response.data) {
        const summary = response.data.summary || {};
        
        statsContainer.innerHTML = `
          <h4 style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #9ca3af;">Processing Statistics</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
            <div>
              <div style="font-size: 1.5rem; font-weight: 600; color: #3b82f6;">${summary.totalItems || 0}</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">Total Items</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 600; color: #10b981;">${summary.processed24h || 0}</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">Last 24h</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 600; color: #8b5cf6;">${((summary.avgConfidence || 0) * 100).toFixed(0)}%</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">Avg Confidence</div>
            </div>
            <div>
              <div style="font-size: 1.5rem; font-weight: 600; color: #f59e0b;">$${(summary.totalCost || 0).toFixed(4)}</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">Total Cost</div>
            </div>
          </div>
        `;
        
        statsContainer.style.display = 'block';
      }
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
    }
  }
}

// Initialize after page load
document.addEventListener('DOMContentLoaded', () => {
  new MailImportManager();
});

