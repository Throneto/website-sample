/**
 * API Service for VALARZAI Knowledge Base
 * 处理与后端API的通信
 */

class ApiService {
  constructor() {
    // 从环境变量或配置中获取API基础URL
    // 优先使用 window.API_URL，其次根据当前域名判断，最后才使用 localhost
    if (window.API_URL) {
      this.baseURL = window.API_URL;
    } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // 生产环境，使用生产API（Dokploy）
      this.baseURL = 'https://api.171780.xyz/api';
    } else {
      // 开发环境，使用本地API
      this.baseURL = 'http://localhost:5000/api';
    }
    this.timeout = 10000; // 10秒超时
    
    console.log('[ApiService] Initialized with baseURL:', this.baseURL);

    // 本地数据键
    this.localKeys = {
      articles: 'valarz_articles',
      categories: 'valarz_categories'
    };
  }

  /**
   * 发送HTTP请求
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ============================================
  // 本地数据读写（静态JSON + localStorage 后备）
  // ============================================

  async loadLocalJSON(path) {
    const response = await fetch(path, { headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    return response.json();
  }

  getLocalData(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Failed to parse localStorage for', key, e);
      return null;
    }
  }

  setLocalData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async ensureInitialized() {
    // 初始化分类
    if (!this.getLocalData(this.localKeys.categories)) {
      try {
        const categories = await this.loadLocalJSON('/data/categories.json');
        this.setLocalData(this.localKeys.categories, categories);
      } catch (e) {
        console.warn('Fallback empty categories due to load error', e);
        this.setLocalData(this.localKeys.categories, []);
      }
    }

    // 初始化文章
    if (!this.getLocalData(this.localKeys.articles)) {
      try {
        const articles = await this.loadLocalJSON('/data/articles.json');
        this.setLocalData(this.localKeys.articles, articles);
      } catch (e) {
        console.warn('Fallback empty articles due to load error', e);
        this.setLocalData(this.localKeys.articles, []);
      }
    }
  }

  // ========== Categories (本地) ==========
  async getLocalCategories() {
    await this.ensureInitialized();
    return this.getLocalData(this.localKeys.categories) || [];
  }

  // ========== Articles (本地) ==========
  async getArticles(params = {}) {
    await this.ensureInitialized();
    const all = this.getLocalData(this.localKeys.articles) || [];

    const search = (params.search || '').toLowerCase();
    const category = params.category && params.category !== 'all' ? params.category : null;

    let filtered = all.slice();
    if (category) {
      filtered = filtered.filter(a => a.category === category);
    }
    if (search) {
      filtered = filtered.filter(a =>
        (a.title || '').toLowerCase().includes(search) ||
        (a.excerpt || '').toLowerCase().includes(search) ||
        (Array.isArray(a.tags) ? a.tags : []).some(t => (t || '').toLowerCase().includes(search))
      );
    }

    // 排序：featured优先，其次按发布时间倒序
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
    });

    const page = Number(params.page || 1);
    const limit = Number(params.limit || filtered.length || 0);
    const offset = (page - 1) * limit;
    const items = limit ? filtered.slice(offset, offset + limit) : filtered;

    return { total: filtered.length, items };
  }

  async createArticle(article) {
    await this.ensureInitialized();
    const articles = this.getLocalData(this.localKeys.articles) || [];
    const nextId = articles.length ? Math.max(...articles.map(a => a.id || 0)) + 1 : 1;
    const now = new Date().toISOString().slice(0, 10);
    const newArticle = {
      id: nextId,
      publishDate: article.publishDate || now,
      views: 0,
      likes: 0,
      featured: false,
      ...article
    };
    articles.push(newArticle);
    this.setLocalData(this.localKeys.articles, articles);
    return newArticle;
  }

  async updateArticle(id, updates) {
    await this.ensureInitialized();
    const articles = this.getLocalData(this.localKeys.articles) || [];
    const idx = articles.findIndex(a => Number(a.id) === Number(id));
    if (idx === -1) throw new Error('Article not found');
    articles[idx] = { ...articles[idx], ...updates };
    this.setLocalData(this.localKeys.articles, articles);
    return articles[idx];
  }

  async deleteArticle(id) {
    await this.ensureInitialized();
    let articles = this.getLocalData(this.localKeys.articles) || [];
    const before = articles.length;
    articles = articles.filter(a => Number(a.id) !== Number(id));
    if (articles.length === before) throw new Error('Article not found');
    this.setLocalData(this.localKeys.articles, articles);
    return { success: true };
  }

  /**
   * 获取所有分类
   */
  async getCategories() {
    try {
      const data = await this.request('/categories');
      return data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取分类
   */
  async getCategoryById(id) {
    try {
      const data = await this.request(`/categories/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  /**
   * 根据类型获取分类
   */
  async getCategoriesByType(type) {
    try {
      const data = await this.request(`/categories/type/${type}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${type} categories:`, error);
      throw error;
    }
  }

  /**
   * 获取hobby分类
   */
  async getHobbyCategories() {
    return this.getCategoriesByType('hobby');
  }

  /**
   * 获取niche分类
   */
  async getNicheCategories() {
    return this.getCategoriesByType('niche');
  }

  /**
   * 检查API健康状态
   */
  async checkHealth() {
    try {
      const data = await this.request('/health');
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * 获取Gmail状态
   */
  async getGmailStatus() {
    try {
      const data = await this.request('/mail/status');
      return data;
    } catch (error) {
      console.error('Gmail status check failed:', error);
      throw error;
    }
  }

  /**
   * 获取Gmail授权URL
   */
  async getGmailAuthUrl() {
    try {
      const data = await this.request('/mail/auth-url');
      return data;
    } catch (error) {
      console.error('Failed to get Gmail auth URL:', error);
      throw error;
    }
  }

  /**
   * 预览邮件
   */
  async previewEmails(maxResults = 10, query = '') {
    try {
      const data = await this.request(`/mail/preview?maxResults=${maxResults}&query=${encodeURIComponent(query)}`);
      return data;
    } catch (error) {
      console.error('Failed to preview emails:', error);
      throw error;
    }
  }

  /**
   * 导入邮件到知识库
   */
  async importEmails(maxResults = 10, query = '', labelIds = ['INBOX']) {
    try {
      const data = await this.request('/mail/import', {
        method: 'POST',
        body: JSON.stringify({
          maxResults,
          query,
          labelIds,
        }),
      });
      return data;
    } catch (error) {
      console.error('Failed to import emails:', error);
      throw error;
    }
  }

  /**
   * 搜索邮件
   */
  async searchEmails(keyword, maxResults = 20) {
    try {
      const data = await this.request(`/mail/search?keyword=${encodeURIComponent(keyword)}&maxResults=${maxResults}`);
      return data;
    } catch (error) {
      console.error('Failed to search emails:', error);
      throw error;
    }
  }

  /**
   * 获取未读邮件
   */
  async getUnreadEmails() {
    try {
      const data = await this.request('/mail/unread');
      return data;
    } catch (error) {
      console.error('Failed to get unread emails:', error);
      throw error;
    }
  }

  /**
   * 获取知识条目列表（支持分页、筛选、搜索）
   * @param {Object} params - 查询参数
   * @param {string} params.category - 分类slug（可选）
   * @param {string} params.search - 搜索关键词（可选）
   * @param {number} params.limit - 每页数量（默认50）
   * @param {number} params.offset - 偏移量（默认0）
   */
  async getKnowledgeItems(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const endpoint = `/knowledge${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const data = await this.request(endpoint);
      return data;
    } catch (error) {
      console.error('Failed to fetch knowledge items:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取单个知识条目
   * @param {number} id - 知识条目ID
   */
  async getKnowledgeItem(id) {
    try {
      const data = await this.request(`/knowledge/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch knowledge item ${id}:`, error);
      throw error;
    }
  }

  /**
   * 创建知识条目
   * @param {Object} itemData - 知识条目数据
   */
  async createKnowledgeItem(itemData) {
    try {
      const data = await this.request('/knowledge', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
      return data;
    } catch (error) {
      console.error('Failed to create knowledge item:', error);
      throw error;
    }
  }

  /**
   * 更新知识条目
   * @param {number} id - 知识条目ID
   * @param {Object} itemData - 要更新的数据
   */
  async updateKnowledgeItem(id, itemData) {
    try {
      const data = await this.request(`/knowledge/${id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });
      return data;
    } catch (error) {
      console.error(`Failed to update knowledge item ${id}:`, error);
      throw error;
    }
  }

  /**
   * 删除知识条目
   * @param {number} id - 知识条目ID
   */
  async deleteKnowledgeItem(id) {
    try {
      const data = await this.request(`/knowledge/${id}`, {
        method: 'DELETE',
      });
      return data;
    } catch (error) {
      console.error(`Failed to delete knowledge item ${id}:`, error);
      throw error;
    }
  }

  /**
   * 获取知识库统计信息
   */
  async getKnowledgeStats() {
    try {
      const data = await this.request('/knowledge/stats/summary');
      return data;
    } catch (error) {
      console.error('Failed to fetch knowledge stats:', error);
      throw error;
    }
  }

  // ============================================
  // AI Processing Methods
  // ============================================

  /**
   * 使用AI处理单个邮件
   * @param {number} mailId - 邮件ID
   */
  async processMailWithAI(mailId) {
    try {
      const data = await this.request(`/ai/process/${mailId}`, {
        method: 'POST',
      });
      return data;
    } catch (error) {
      console.error(`Failed to process mail ${mailId} with AI:`, error);
      throw error;
    }
  }

  /**
   * 批量处理邮件
   * @param {number[]} mailIds - 邮件ID数组
   * @param {Object} options - 处理选项
   */
  async processBatchWithAI(mailIds, options = {}) {
    try {
      const data = await this.request('/ai/process-batch', {
        method: 'POST',
        body: JSON.stringify({ mailIds, options }),
      });
      return data;
    } catch (error) {
      console.error('Failed to process batch with AI:', error);
      throw error;
    }
  }

  /**
   * 获取AI处理状态
   * @param {number} knowledgeId - 知识条目ID
   */
  async getAIProcessingStatus(knowledgeId) {
    try {
      const data = await this.request(`/ai/status/${knowledgeId}`);
      return data;
    } catch (error) {
      console.error(`Failed to get AI processing status for ${knowledgeId}:`, error);
      throw error;
    }
  }

  /**
   * 获取AI处理统计信息
   */
  async getAIStats() {
    try {
      const data = await this.request('/ai/stats');
      return data;
    } catch (error) {
      console.error('Failed to get AI stats:', error);
      throw error;
    }
  }

  /**
   * 重新处理知识条目
   * @param {number} knowledgeId - 知识条目ID
   */
  async reprocessKnowledge(knowledgeId) {
    try {
      const data = await this.request(`/ai/reprocess/${knowledgeId}`, {
        method: 'POST',
      });
      return data;
    } catch (error) {
      console.error(`Failed to reprocess knowledge ${knowledgeId}:`, error);
      throw error;
    }
  }

  /**
   * 获取待处理的邮件列表
   * @param {number} limit - 数量限制
   */
  async getPendingItems(limit = 10) {
    try {
      const data = await this.request(`/ai/pending?limit=${limit}`);
      return data;
    } catch (error) {
      console.error('Failed to get pending items:', error);
      throw error;
    }
  }

  // ============================================
  // Database Migration Methods
  // ============================================

  /**
   * 执行 Gemini 数据库迁移
   */
  async runGeminiMigration() {
    try {
      const data = await this.request('/database/migrate', {
        method: 'POST'
      });
      return data;
    } catch (error) {
      console.error('Failed to run Gemini migration:', error);
      throw error;
    }
  }

  /**
   * 检查 Gemini 迁移状态
   */
  async checkGeminiMigrationStatus() {
    try {
      const data = await this.request('/database/migration-status');
      return data;
    } catch (error) {
      console.error('Failed to check Gemini migration status:', error);
      throw error;
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getDatabaseStats() {
    try {
      const data = await this.request('/database/stats');
      return data;
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * 获取处理日志
   * @param {number} knowledgeId - 知识条目ID
   */
  async getProcessingLogs(knowledgeId) {
    try {
      const data = await this.request(`/ai/logs/${knowledgeId}`);
      return data;
    } catch (error) {
      console.error(`Failed to get processing logs for ${knowledgeId}:`, error);
      throw error;
    }
  }
}

// 创建全局API服务实例
window.apiService = new ApiService();

// 调试: 验证方法是否存在
console.log('[ApiService] Methods check:', {
  checkGeminiMigrationStatus: typeof window.apiService.checkGeminiMigrationStatus,
  runGeminiMigration: typeof window.apiService.runGeminiMigration,
  getDatabaseStats: typeof window.apiService.getDatabaseStats
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
