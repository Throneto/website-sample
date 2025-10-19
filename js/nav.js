// 导航交互脚本
(function() {
    'use strict';

    // ========== 工具函数 ==========
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 获取DOM元素
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // 汉堡菜单切换
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            // 防止背景滚动
            document.body.classList.toggle('menu-open');
        });
    }

    // 点击导航链接关闭移动端菜单
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // 导航链接点击处理（保留用于未来扩展）
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // 页面跳转将由浏览器默认处理
            // 这里可以添加页面跳转前的自定义逻辑
        });
    });

    // 滚动时添加导航栏背景（使用节流优化性能）
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateNavbar() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScrollY = window.scrollY;
        ticking = false;
    }

    // 使用requestAnimationFrame优化滚动性能
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 页面加载时检查滚动位置
    updateNavbar();

    // 当前页面链接高亮
    function highlightActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            
            // 高亮当前页面的导航链接
            if (linkHref === currentPage || 
                (currentPage === '' && linkHref === 'index.html') ||
                (currentPage === 'index.html' && linkHref === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // 页面加载时高亮当前页面
    highlightActiveLink();

    // 页面加载动画（优化版本）
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('page-transition');
    });

    // 添加平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 点击页面其他区域关闭移动端菜单
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // 监听窗口大小变化，关闭移动端菜单（使用防抖优化）
    const handleResize = debounce(() => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }, 250);

    window.addEventListener('resize', handleResize);

    // 为卡片添加视差滚动效果（性能优化版本）
    const cards = document.querySelectorAll('.glass-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 使用requestAnimationFrame优化动画性能
                requestAnimationFrame(() => {
                    entry.target.classList.add('fade-in-up');
                });
                cardObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach((card, index) => {
        // 初始状态
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        // 添加延迟以创建交错效果
        card.style.transitionDelay = `${index * 0.1}s`;
        cardObserver.observe(card);
    });

    // 为section标题添加视差效果
    const sectionTitles = document.querySelectorAll('.section-title');
    
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 50);
                
                titleObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sectionTitles.forEach(title => {
        titleObserver.observe(title);
    });

    // 鼠标移动时为CTA按钮添加3D效果
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('mousemove', (e) => {
            const rect = ctaButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            ctaButton.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });
        
        ctaButton.addEventListener('mouseleave', () => {
            ctaButton.style.transform = '';
        });
    }

    // 为社交链接添加波纹效果
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    console.log('🚀 VALARZAI 导航系统已加载');
})();

