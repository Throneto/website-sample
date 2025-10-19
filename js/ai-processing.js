/**
 * AI Processing Management Page JavaScript
 */

// Global state
let currentPendingItems = [];
let isBatchProcessing = false;

// API Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001/api'
  : 'https://api.valarzai.com/api';

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('AI Processing Manager initialized');
  
  // Load initial data
  refreshStats();
  refreshPending();
  
  // Set auto refresh (every 30 seconds)
  setInterval(() => {
    if (!isBatchProcessing) {
      refreshStats();
    }
  }, 30000);
});

// ==========================================
// Statistics
// ==========================================
async function refreshStats() {
  try {
    console.log('🔄 Fetching stats from:', `${API_BASE}/ai/stats`);
    
    // Don't replace entire statsGrid, keep card structure
    const response = await fetch(`${API_BASE}/ai/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📊 Stats API response:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch statistics');
    }
    
    if (!result.data) {
      throw new Error('API returned empty data');
    }
    
    updateStatsDisplay(result.data);
    console.log('✅ Stats updated successfully');
    
  } catch (error) {
    console.error('❌ Failed to refresh stats:', error);
    // Don't use alert to avoid interrupting user
    console.error('Stats refresh error details:', {
      error: error.message,
      stack: error.stack
    });
  }
}

function updateStatsDisplay(data) {
  // Defensive check: ensure data structure is correct
  if (!data || typeof data !== 'object') {
    console.error('Invalid data structure:', data);
    return;
  }
  
  const summary = data.summary || {};
  
  // Safely update element content
  const totalItems = document.getElementById('totalItems');
  const processed24h = document.getElementById('processed24h');
  const avgConfidence = document.getElementById('avgConfidence');
  const totalCost = document.getElementById('totalCost');
  
  // Check if elements exist
  if (!totalItems || !processed24h || !avgConfidence || !totalCost) {
    console.error('Stats display elements not found in DOM');
    return;
  }
  
  // Safely update content
  try {
    totalItems.textContent = summary.totalItems || 0;
    processed24h.textContent = summary.processed24h || 0;
    avgConfidence.textContent = summary.avgConfidence 
      ? (summary.avgConfidence * 100).toFixed(1) + '%' 
      : 'N/A';
    totalCost.textContent = summary.totalCost 
      ? '$' + summary.totalCost.toFixed(4) 
      : '$0.00';
  } catch (error) {
    console.error('Error updating stats display:', error);
  }
}

// ==========================================
// Pending List
// ==========================================
async function refreshPending() {
  try {
    const limit = document.getElementById('pendingLimit').value;
    const pendingList = document.getElementById('pendingList');
    
    showLoading('pendingList', 'Loading pending items...');
    
    const response = await fetch(`${API_BASE}/ai/pending?limit=${limit}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch pending list');
    }
    
    currentPendingItems = result.data.items;
    updatePendingDisplay(result.data.items);
    
  } catch (error) {
    console.error('Failed to refresh pending:', error);
    showError('pendingList', 'Failed to load pending list: ' + error.message);
  }
}

function updatePendingDisplay(items) {
  const pendingList = document.getElementById('pendingList');
  
  if (items.length === 0) {
    pendingList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎉</div>
        <div class="empty-state-text">No pending items</div>
      </div>
    `;
    return;
  }
  
  pendingList.innerHTML = items.map(item => `
    <div class="pending-item" data-id="${item.id}">
      <div class="pending-item-info">
        <div class="pending-item-title">${escapeHtml(item.title || '(No Title)')}</div>
        <div class="pending-item-meta">
          ID: ${item.id} | 
          Created: ${formatDate(item.created_at)} |
          Content Length: ${item.content ? item.content.length : 0} chars
        </div>
      </div>
      <div class="pending-item-actions">
        <button class="btn btn-primary" onclick="processSingleItem(${item.id})">
          <span class="btn-icon">▶️</span>
          Process
        </button>
        <button class="btn btn-secondary" onclick="viewDetails(${item.id})">
          <span class="btn-icon">👁️</span>
          View
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// Single Item Processing
// ==========================================
async function processSingle() {
  const mailId = document.getElementById('mailId').value;
  
  if (!mailId || isNaN(mailId)) {
    alert('Please enter a valid Mail/Knowledge ID');
    return;
  }
  
  await processSingleItem(parseInt(mailId));
}

async function processSingleItem(id) {
  try {
    const resultDiv = document.getElementById('singleResult');
    resultDiv.innerHTML = '<div class="loading">Processing, please wait...</div>';
    resultDiv.className = 'result-container';
    
    // Update list item status
    updatePendingItemStatus(id, 'processing');
    
    const response = await fetch(`${API_BASE}/ai/process/${id}`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      if (result.data.status === 'completed') {
        resultDiv.className = 'result-container success';
        resultDiv.innerHTML = `
          <h4>✅ Processing Successful</h4>
          <p><strong>Knowledge ID:</strong> ${result.data.knowledgeId}</p>
          <p><strong>Title:</strong> ${result.data.data?.title || 'N/A'}</p>
          <p><strong>Category:</strong> ${result.data.data?.category || 'N/A'}</p>
          <p><strong>Tags:</strong> ${result.data.data?.tags?.join(', ') || 'N/A'}</p>
          <p><strong>Confidence:</strong> ${result.data.data?.confidence ? (result.data.data.confidence * 100).toFixed(1) + '%' : 'N/A'}</p>
        `;
        updatePendingItemStatus(id, 'completed');
      } else if (result.data.status === 'skipped') {
        resultDiv.className = 'result-container warning';
        resultDiv.innerHTML = `
          <h4>⏭️ Skipped</h4>
          <p><strong>Reason:</strong> ${result.data.reason || 'N/A'}</p>
        `;
        updatePendingItemStatus(id, 'completed');
      }
    } else {
      throw new Error(result.message || result.error || 'Processing failed');
    }
    
    // Refresh stats and list
    setTimeout(() => {
      refreshStats();
      refreshPending();
    }, 1000);
    
  } catch (error) {
    console.error('Processing failed:', error);
    const resultDiv = document.getElementById('singleResult');
    resultDiv.className = 'result-container error';
    resultDiv.innerHTML = `
      <h4>❌ Processing Failed</h4>
      <p>${error.message}</p>
    `;
    updatePendingItemStatus(id, 'failed');
  }
}

// ==========================================
// Batch Processing
// ==========================================
async function processPendingBatch() {
  if (currentPendingItems.length === 0) {
    alert('No pending items to process');
    return;
  }
  
  if (isBatchProcessing) {
    alert('Batch processing is already in progress...');
    return;
  }
  
  const concurrency = parseInt(document.getElementById('concurrency').value);
  const mailIds = currentPendingItems.map(item => item.id);
  
  const confirmed = confirm(`Confirm batch processing of ${mailIds.length} items?\nConcurrency: ${concurrency}`);
  if (!confirmed) return;
  
  isBatchProcessing = true;
  
  // Show progress section
  const progressSection = document.getElementById('batchProgressSection');
  progressSection.style.display = 'block';
  
  // Reset progress
  updateBatchProgress(0, mailIds.length, 0, 0, 0);
  clearProgressLog();
  
  // Disable batch process button
  const batchBtn = document.getElementById('batchProcessBtn');
  batchBtn.disabled = true;
  batchBtn.textContent = '⏳ Processing...';
  
  try {
    // Use SSE for batch processing
    await processBatchWithSSE(mailIds, concurrency);
  } catch (error) {
    console.error('Batch processing failed:', error);
    addProgressLog('error', `Batch processing failed: ${error.message}`);
    alert('Batch processing failed: ' + error.message);
  } finally {
    isBatchProcessing = false;
    batchBtn.disabled = false;
    batchBtn.innerHTML = '<span class="btn-icon">⚡</span>Batch Process';
    
    // Refresh data
    refreshStats();
    refreshPending();
  }
}

async function processBatchWithSSE(mailIds, concurrency) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `${API_BASE}/ai/process-batch`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'text/event-stream');
    
    let buffer = '';
    
    xhr.onprogress = function() {
      buffer += xhr.responseText.substr(buffer.length);
      
      // Process SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete lines
      
      lines.forEach(line => {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substr(6));
            
            if (data.type === 'progress') {
              updateBatchProgress(
                data.processed,
                data.total,
                data.completed,
                data.skipped,
                data.failed
              );
              
              addProgressLog('info', 
                `Progress: ${data.processed}/${data.total} - ` +
                `Success: ${data.completed}, Skipped: ${data.skipped}, Failed: ${data.failed}`
              );
            } else if (data.type === 'complete') {
              const result = data.result;
              updateBatchProgress(
                result.total,
                result.total,
                result.completed,
                result.skipped,
                result.failed
              );
              
              addProgressLog('success', 
                `✅ Batch processing complete! Total: ${result.total}, ` +
                `Success: ${result.completed}, Skipped: ${result.skipped}, Failed: ${result.failed}`
              );
              
              resolve(result);
            }
          } catch (e) {
            console.error('Failed to parse SSE message:', e);
          }
        }
      });
    };
    
    xhr.onerror = function() {
      reject(new Error('Network request failed'));
    };
    
    xhr.onload = function() {
      if (xhr.status !== 200) {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    };
    
    xhr.send(JSON.stringify({
      mailIds,
      concurrency
    }));
  });
}

function updateBatchProgress(processed, total, completed, skipped, failed) {
  const percentage = total > 0 ? (processed / total * 100) : 0;
  
  document.getElementById('progressFill').style.width = percentage + '%';
  document.getElementById('progressText').textContent = `${processed} / ${total}`;
  document.getElementById('progressCompleted').textContent = completed;
  document.getElementById('progressSkipped').textContent = skipped;
  document.getElementById('progressFailed').textContent = failed;
}

function addProgressLog(type, message) {
  const logDiv = document.getElementById('progressLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logDiv.appendChild(entry);
  logDiv.scrollTop = logDiv.scrollHeight;
}

function clearProgressLog() {
  document.getElementById('progressLog').innerHTML = '';
}

// ==========================================
// Status Check
// ==========================================
async function checkStatus() {
  const mailId = document.getElementById('mailId').value;
  
  if (!mailId || isNaN(mailId)) {
    alert('Please enter a valid Knowledge ID');
    return;
  }
  
  await viewDetails(parseInt(mailId));
}

async function viewDetails(id) {
  try {
    const response = await fetch(`${API_BASE}/ai/status/${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to get status');
    }
    
    showDetailsModal(result.data);
    
  } catch (error) {
    console.error('Failed to get status:', error);
    alert('Failed to get status: ' + error.message);
  }
}

function showDetailsModal(data) {
  const modal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalBody');
  
  const item = data.item;
  const logs = data.logs || [];
  
  modalBody.innerHTML = `
    <div class="details-content">
      <h4>Basic Information</h4>
      <table class="details-table">
        <tr>
          <td><strong>ID:</strong></td>
          <td>${item.id}</td>
        </tr>
        <tr>
          <td><strong>Title:</strong></td>
          <td>${escapeHtml(item.title || 'N/A')}</td>
        </tr>
        <tr>
          <td><strong>Processing Status:</strong></td>
          <td><span class="status-badge status-${item.processing_status}">${item.processing_status}</span></td>
        </tr>
        <tr>
          <td><strong>Confidence:</strong></td>
          <td>${item.ai_confidence ? (item.ai_confidence * 100).toFixed(1) + '%' : 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Content Type:</strong></td>
          <td>${item.content_type || 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Subcategory:</strong></td>
          <td>${item.subcategory || 'N/A'}</td>
        </tr>
      </table>
      
      ${item.ai_tags && item.ai_tags.length > 0 ? `
        <h4>Tags</h4>
        <div class="tags-list">
          ${item.ai_tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      
      ${item.key_points && item.key_points.length > 0 ? `
        <h4>Key Points</h4>
        <ul class="key-points-list">
          ${item.key_points.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${logs.length > 0 ? `
        <h4>Processing Logs</h4>
        <table class="logs-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Status</th>
              <th>Input Tokens</th>
              <th>Output Tokens</th>
              <th>Duration</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr class="${log.status}">
                <td>${log.stage}</td>
                <td>${log.status}</td>
                <td>${log.input_tokens || '-'}</td>
                <td>${log.output_tokens || '-'}</td>
                <td>${log.duration_ms ? log.duration_ms + 'ms' : '-'}</td>
                <td>${formatDate(log.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>
    
    <style>
      .details-content { padding: 1rem 0; }
      .details-content h4 { margin: 1.5rem 0 1rem; color: #333; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
      .details-table td { padding: 0.5rem; border-bottom: 1px solid #e9ecef; color: #333; }
      .details-table td:first-child { width: 150px; color: #666; }
      .status-badge { 
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
      }
      .status-completed { background: #d4edda; color: #155724; }
      .status-processing { background: #fff3cd; color: #856404; }
      .status-pending { background: #d1ecf1; color: #0c5460; }
      .status-failed { background: #f8d7da; color: #721c24; }
      .status-skipped { background: #e2e3e5; color: #383d41; }
      .tags-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .tag { 
        background: #667eea;
        color: #e8e8e8;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.85rem;
      }
      .key-points-list { padding-left: 1.5rem; color: #333; }
      .key-points-list li { margin-bottom: 0.5rem; }
      .logs-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      .logs-table th { 
        background: #f8f9fa;
        padding: 0.75rem;
        text-align: left;
        border-bottom: 2px solid #dee2e6;
        color: #333;
      }
      .logs-table td { 
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid #e9ecef;
        color: #333;
      }
      .logs-table tr.success { background: #f0f9f4; }
      .logs-table tr.failed { background: #fef5f5; }
    </style>
  `;
  
  modal.classList.add('show');
}

function closeModal() {
  document.getElementById('detailsModal').classList.remove('show');
}

// Click outside modal to close
document.addEventListener('click', (e) => {
  const modal = document.getElementById('detailsModal');
  if (e.target === modal) {
    closeModal();
  }
});

// ==========================================
// Retry Processing
// ==========================================
async function retryProcessing() {
  const mailId = document.getElementById('mailId').value;
  
  if (!mailId || isNaN(mailId)) {
    alert('Please enter a valid Knowledge ID');
    return;
  }
  
  const confirmed = confirm(`Confirm retry processing for ID: ${mailId}?`);
  if (!confirmed) return;
  
  try {
    const resultDiv = document.getElementById('singleResult');
    resultDiv.innerHTML = '<div class="loading">Reprocessing, please wait...</div>';
    resultDiv.className = 'result-container';
    
    const response = await fetch(`${API_BASE}/ai/retry/${mailId}`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      resultDiv.className = 'result-container success';
      resultDiv.innerHTML = `
        <h4>✅ Retry Successful</h4>
        <p><strong>Knowledge ID:</strong> ${result.data.knowledgeId}</p>
        <p><strong>Status:</strong> ${result.data.status}</p>
      `;
      
      // Refresh data
      setTimeout(() => {
        refreshStats();
        refreshPending();
      }, 1000);
    } else {
      throw new Error(result.message || result.error || 'Retry failed');
    }
    
  } catch (error) {
    console.error('Retry failed:', error);
    const resultDiv = document.getElementById('singleResult');
    resultDiv.className = 'result-container error';
    resultDiv.innerHTML = `
      <h4>❌ Retry Failed</h4>
      <p>${error.message}</p>
    `;
  }
}

// ==========================================
// Utility Functions
// ==========================================
function showLoading(elementId, message = 'Loading...') {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="loading">${message}</div>`;
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  element.innerHTML = `
    <div class="error-message" style="
      text-align: center;
      padding: 2rem;
      color: #dc3545;
    ">
      ❌ ${message}
    </div>
  `;
}

function updatePendingItemStatus(id, status) {
  const item = document.querySelector(`.pending-item[data-id="${id}"]`);
  if (item) {
    item.classList.remove('processing', 'completed', 'failed');
    item.classList.add(status);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US');
}

