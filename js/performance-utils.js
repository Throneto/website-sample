// 性能优化工具库
(function() {
    'use strict';

    // ========== 性能监控 ==========
    const PerformanceMonitor = {
        // 检测是否为低性能设备
        isLowEndDevice() {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const cores = navigator.hardwareConcurrency || 2;
            const memory = navigator.deviceMemory || 4;
            
            return isMobile || cores < 4 || memory < 4;
        },

        // 检测网络连接速度
        getConnectionSpeed() {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (!connection) return 'unknown';
            
            const effectiveType = connection.effectiveType;
            const downlink = connection.downlink;
            
            if (effectiveType === '4g' && downlink > 5) return 'fast';
            if (effectiveType === '4g' || effectiveType === '3g') return 'medium';
            return 'slow';
        },

        // 测量帧率
        measureFPS(callback, duration = 1000) {
            let frameCount = 0;
            let lastTime = performance.now();
            let running = true;

            function count() {
                if (!running) return;
                frameCount++;
                requestAnimationFrame(count);
            }

            count();

            setTimeout(() => {
                running = false;
                const elapsed = performance.now() - lastTime;
                const fps = Math.round((frameCount / elapsed) * 1000);
                callback(fps);
            }, duration);
        }
    };

    // ========== 资源加载优化 ==========
    const ResourceLoader = {
        // 延迟加载图片
        lazyLoadImages() {
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.classList.add('loaded');
                            }
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            } else {
                // 降级方案：直接加载所有图片
                images.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                    }
                });
            }
        },

        // 预加载关键资源
        preloadResources(urls, type = 'fetch') {
            urls.forEach(url => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = type;
                link.href = url;
                document.head.appendChild(link);
            });
        }
    };

    // ========== 动画优化 ==========
    const AnimationOptimizer = {
        // 根据设备性能调整动画
        optimizeAnimations() {
            if (PerformanceMonitor.isLowEndDevice()) {
                // 禁用复杂动画
                document.documentElement.classList.add('reduce-animations');
                
                // 降低动画复杂度
                const style = document.createElement('style');
                style.textContent = `
                    .reduce-animations * {
                        animation-duration: 0.3s !important;
                        transition-duration: 0.2s !important;
                    }
                    .reduce-animations .bg-container {
                        display: none;
                    }
                `;
                document.head.appendChild(style);
            }
        },

        // 使用requestAnimationFrame优化动画
        createRAFAnimation(callback) {
            let animationId;
            let lastTime = 0;
            
            function animate(currentTime) {
                animationId = requestAnimationFrame(animate);
                const deltaTime = currentTime - lastTime;
                
                if (deltaTime >= 16.67) { // ~60fps
                    callback(deltaTime);
                    lastTime = currentTime;
                }
            }
            
            animate(0);
            
            return () => cancelAnimationFrame(animationId);
        }
    };

    // ========== 缓存管理 ==========
    const CacheManager = {
        // 本地存储缓存
        set(key, value, expiryMinutes = 60) {
            const item = {
                value: value,
                expiry: new Date().getTime() + (expiryMinutes * 60 * 1000)
            };
            try {
                localStorage.setItem(key, JSON.stringify(item));
            } catch (e) {
                console.warn('LocalStorage is full or unavailable:', e);
            }
        },

        get(key) {
            try {
                const itemStr = localStorage.getItem(key);
                if (!itemStr) return null;

                const item = JSON.parse(itemStr);
                if (new Date().getTime() > item.expiry) {
                    localStorage.removeItem(key);
                    return null;
                }
                return item.value;
            } catch (e) {
                console.warn('Error reading from LocalStorage:', e);
                return null;
            }
        },

        clear() {
            try {
                localStorage.clear();
            } catch (e) {
                console.warn('Error clearing LocalStorage:', e);
            }
        }
    };

    // ========== 防抖和节流 ==========
    const Utilities = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // RAF节流（用于滚动等高频事件）
        rafThrottle(callback) {
            let requestId = null;
            
            return function(...args) {
                if (requestId === null) {
                    requestId = requestAnimationFrame(() => {
                        callback.apply(this, args);
                        requestId = null;
                    });
                }
            };
        }
    };

    // ========== 初始化 ==========
    function init() {
        // 检测并优化动画
        AnimationOptimizer.optimizeAnimations();

        // 延迟加载图片
        ResourceLoader.lazyLoadImages();

        // 监控性能（开发环境）
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            PerformanceMonitor.measureFPS((fps) => {
                console.log(`🎯 当前FPS: ${fps}`);
                if (fps < 30) {
                    console.warn('⚠️ 检测到低帧率，建议优化');
                }
            });
        }

        // 打印性能信息
        console.log('📊 性能信息:', {
            设备类型: PerformanceMonitor.isLowEndDevice() ? '低性能设备' : '高性能设备',
            网络速度: PerformanceMonitor.getConnectionSpeed(),
            核心数: navigator.hardwareConcurrency || '未知',
            内存: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : '未知'
        });
    }

    // 导出到全局作用域
    window.PerformanceUtils = {
        PerformanceMonitor,
        ResourceLoader,
        AnimationOptimizer,
        CacheManager,
        ...Utilities
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('⚡ 性能优化工具已加载');
})();

