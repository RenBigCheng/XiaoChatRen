/* ==========================================
   3D全息投影机器人交互脚本
   3D Hologram Robot Interactive Script
   ========================================== */

class HologramRobot {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.isActive = false;
        this.animationId = null;
        this.currentRole = 'assistant';
        this.isTransforming = false;
        
        // 角色配置
        this.roles = {
            assistant: {
                name: '智能助手',
                voice: '你好！我是你的智能助手，可以帮你解答各种问题',
                colors: {
                    primary: '#007AFF',
                    secondary: '#5AC8FA',
                    particle: '#007AFF'
                }
            },
            teacher: {
                name: 'AI教师',
                voice: '我是你的AI教师，让我们一起探索知识的海洋吧！',
                colors: {
                    primary: '#34C759',
                    secondary: '#30D158',
                    particle: '#34C759'
                }
            },
            doctor: {
                name: 'AI医生',
                voice: '我是你的AI医生，关注你的健康是我的使命',
                colors: {
                    primary: '#FF3B30',
                    secondary: '#FFFFFF',
                    particle: '#FF3B30'
                }
            },
            leader: {
                name: 'AI领导',
                voice: '我是你的AI领导，让我为你提供战略性的指导建议',
                colors: {
                    primary: '#FF9500',
                    secondary: '#FFD60A',
                    particle: '#FF9500'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.bindEvents();
        this.startAnimation();
    }
    
    // 创建粒子系统
    createParticles() {
        const particleContainer = this.container.querySelector('.hologram-particles');
        if (!particleContainer) return;
        
        // 创建30个粒子
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机位置和延迟
            const delay = Math.random() * 6;
            const x = Math.random() * 100;
            const hue = Math.random() * 60 + 200; // 蓝紫色系
            
            particle.style.left = `${x}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.background = `hsl(${hue}, 80%, 60%)`;
            
            particleContainer.appendChild(particle);
            this.particles.push(particle);
        }
    }
    
    // 绑定交互事件
    bindEvents() {
        this.container.addEventListener('mouseenter', () => this.onMouseEnter());
        this.container.addEventListener('mouseleave', () => this.onMouseLeave());
        this.container.addEventListener('click', () => this.onRobotClick());
    }
    
    // 鼠标进入事件
    onMouseEnter() {
        this.isActive = true;
        this.container.classList.add('active');
        this.accelerateAnimations();
        this.intensifyParticles();
    }
    
    // 鼠标离开事件
    onMouseLeave() {
        this.isActive = false;
        this.container.classList.remove('active');
        this.normalizeAnimations();
        this.normalizeParticles();
    }
    
    // 点击事件 - 角色切换
    onRobotClick() {
        if (this.isTransforming) return; // 防止重复点击
        
        // 切换到下一个角色
        this.switchToNextRole();
        
        // 视觉反馈效果
        this.container.classList.add('clicked');
        setTimeout(() => {
            this.container.classList.remove('clicked');
        }, 300);
    }
    
    // 切换到下一个角色
    switchToNextRole() {
        const roleKeys = Object.keys(this.roles);
        const currentIndex = roleKeys.indexOf(this.currentRole);
        const nextIndex = (currentIndex + 1) % roleKeys.length;
        const nextRole = roleKeys[nextIndex];
        
        this.transformToRole(nextRole);
    }
    
    // 变身到指定角色
    transformToRole(newRole) {
        if (this.currentRole === newRole || this.isTransforming) return;
        
        this.isTransforming = true;
        const oldRole = this.currentRole;
        this.currentRole = newRole;
        
        // 开始变身动画
        this.startTransformation(oldRole, newRole);
        
        // 通知外部角色变化
        this.dispatchRoleChangeEvent(newRole);
    }
    
    // 开始变身动画
    startTransformation(oldRole, newRole) {
        // 添加变身类
        this.container.classList.add('transforming');
        
        // 创建变身特效
        this.createTransformationEffects();
        
        // 延迟更新角色属性，让动画先开始
        setTimeout(() => {
            this.updateRoleAppearance(newRole);
        }, 300);
        
        // 播放角色语音
        setTimeout(() => {
            this.playRoleVoice(newRole);
        }, 600);
        
        // 动画结束后清理
        setTimeout(() => {
            this.container.classList.remove('transforming');
            this.isTransforming = false;
        }, 1200);
    }
    
    // 更新角色外观
    updateRoleAppearance(role) {
        // 更新容器的角色属性
        this.container.setAttribute('data-role', role);
        
        // 更新粒子颜色
        this.updateParticleColors(role);
    }
    
    // 创建变身特效
    createTransformationEffects() {
        // 创建能量波纹
        this.createEnergyRipple();
        
        // 创建粒子爆发
        this.burstParticles();
        
        // 机器人闪光
        this.flashRobot();
    }
    
    // 播放角色语音
    playRoleVoice(role) {
        const roleConfig = this.roles[role];
        if (roleConfig && roleConfig.voice) {
            // 使用 Web Speech API 播放语音
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(roleConfig.voice);
                utterance.lang = 'zh-CN';
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 0.8;
                
                // 根据角色调整音色
                const voices = speechSynthesis.getVoices();
                if (voices.length > 0) {
                    // 尝试找到中文语音
                    const chineseVoice = voices.find(voice => 
                        voice.lang.includes('zh') || voice.lang.includes('CN')
                    );
                    if (chineseVoice) {
                        utterance.voice = chineseVoice;
                    }
                }
                
                speechSynthesis.speak(utterance);
            }
        }
    }
    
    // 派发角色变化事件
    dispatchRoleChangeEvent(newRole) {
        const event = new CustomEvent('roleChanged', {
            detail: {
                newRole: newRole,
                roleConfig: this.roles[newRole]
            }
        });
        this.container.dispatchEvent(event);
    }
    
    // 外部设置角色（用于同步）
    setRole(role, skipAnimation = false) {
        if (!this.roles[role] || this.currentRole === role) return;
        
        const oldRole = this.currentRole;
        this.currentRole = role;
        
        if (skipAnimation) {
            // 跳过动画，直接更新外观（同步调用，不派发事件）
            this.updateRoleAppearance(role);
        } else {
            // 正常变身，会自动派发事件
            this.transformToRole(role);
        }
    }
    
    // 获取当前角色
    getCurrentRole() {
        return this.currentRole;
    }
    
    // 加速动画
    accelerateAnimations() {
        const robot = this.container.querySelector('.robot-3d');
        const rings = this.container.querySelectorAll('.hologram-ring');
        
        if (robot) {
            robot.style.animationDuration = '3s, 10s';
        }
        
        rings.forEach((ring, index) => {
            const baseDuration = [8, 12, 15][index] || 10;
            ring.style.animationDuration = `${baseDuration / 2}s`;
        });
    }
    
    // 恢复正常动画速度
    normalizeAnimations() {
        const robot = this.container.querySelector('.robot-3d');
        const rings = this.container.querySelectorAll('.hologram-ring');
        
        if (robot) {
            robot.style.animationDuration = '6s, 20s';
        }
        
        rings.forEach((ring, index) => {
            const baseDuration = [8, 12, 15][index] || 10;
            ring.style.animationDuration = `${baseDuration}s`;
        });
    }
    
    // 增强粒子效果
    intensifyParticles() {
        this.particles.forEach((particle, index) => {
            const delay = (Math.random() * 3);
            const scale = 1 + Math.random() * 0.5;
            
            particle.style.animationDuration = '3s';
            particle.style.animationDelay = `${delay}s`;
            particle.style.transform = `scale(${scale})`;
            particle.style.opacity = '0.8';
        });
    }
    
    // 恢复正常粒子效果
    normalizeParticles() {
        this.particles.forEach((particle) => {
            particle.style.animationDuration = '6s';
            particle.style.transform = 'scale(1)';
            particle.style.opacity = '';
        });
    }
    
    // 创建能量波纹效果
    createEnergyRipple() {
        const ripple = document.createElement('div');
        ripple.className = 'energy-ripple';
        
        this.container.appendChild(ripple);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 1000);
    }
    
    // 机器人闪光效果
    flashRobot() {
        const robotHead = this.container.querySelector('.robot-head');
        const robotBody = this.container.querySelector('.robot-body');
        
        if (robotHead && robotBody) {
            robotHead.style.transition = 'box-shadow 0.2s ease-out';
            robotBody.style.transition = 'box-shadow 0.2s ease-out';
            
            robotHead.style.boxShadow = '0 0 60px rgba(0, 122, 255, 1), inset 0 0 40px rgba(255, 255, 255, 0.6)';
            robotBody.style.boxShadow = '0 0 40px rgba(90, 200, 250, 0.8), inset 0 0 25px rgba(255, 255, 255, 0.4)';
            
            setTimeout(() => {
                robotHead.style.boxShadow = '';
                robotBody.style.boxShadow = '';
                robotHead.style.transition = '';
                robotBody.style.transition = '';
            }, 300);
        }
    }
    
    // 粒子爆发效果
    burstParticles() {
        // 临时创建更多粒子
        const particleContainer = this.container.querySelector('.hologram-particles');
        if (!particleContainer) return;
        
        const burstParticles = [];
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.position = 'absolute';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.background = `hsl(${200 + Math.random() * 60}, 90%, 70%)`;
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            
            const angle = (i / 15) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const duration = 0.8 + Math.random() * 0.4;
            
            particle.style.animation = `burstParticle ${duration}s ease-out forwards`;
            particle.style.setProperty('--burst-x', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--burst-y', `${Math.sin(angle) * distance}px`);
            
            particleContainer.appendChild(particle);
            burstParticles.push(particle);
        }
        
        // 清理爆发粒子
        setTimeout(() => {
            burstParticles.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }, 1200);
    }
    
    // 开始动画循环
    startAnimation() {
        this.animate();
    }
    
    // 动画循环
    animate() {
        // 这里可以添加基于时间的动画逻辑
        this.updateParticleColors();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // 更新粒子颜色
    updateParticleColors(role = null) {
        const targetRole = role || this.currentRole;
        const roleConfig = this.roles[targetRole];
        
        if (!roleConfig) return;
        
        if (role) {
            // 立即更新到指定角色的颜色
            this.particles.forEach(particle => {
                particle.style.background = roleConfig.colors.particle;
            });
        } else if (this.isActive) {
            // 动态颜色变化（仅在激活状态）
            const time = Date.now() * 0.001;
            const baseColor = roleConfig.colors.particle;
            
            this.particles.forEach((particle, index) => {
                // 保持角色主色调，添加轻微变化
                particle.style.background = baseColor;
            });
        }
    }
    
    // 销毁实例
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 清理事件监听器
        this.container.removeEventListener('mouseenter', this.onMouseEnter);
        this.container.removeEventListener('mouseleave', this.onMouseLeave);
        this.container.removeEventListener('click', this.onRobotClick);
        
        // 清理粒子
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        this.particles = [];
    }
}

// 添加爆发粒子的CSS动画
const style = document.createElement('style');
style.textContent = `
@keyframes burstParticle {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
    }
    100% {
        transform: translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y))) scale(1);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);

// 工具函数：创建3D机器人
function createHologramRobot(containerId, initialRole = 'assistant') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return null;
    }
    
    // 创建机器人HTML结构
    container.innerHTML = `
        <div class="robot-3d-container" data-role="${initialRole}">
            <div class="robot-3d">
                <!-- 机器人头部 -->
                <div class="robot-head">
                    <div class="robot-eyes">
                        <div class="robot-eye"></div>
                        <div class="robot-eye"></div>
                    </div>
                    <div class="robot-mouth"></div>
                </div>
                
                <!-- 机器人身体 -->
                <div class="robot-body"></div>
                
                <!-- 机器人手臂 -->
                <div class="robot-arms">
                    <div class="robot-arm left"></div>
                    <div class="robot-arm right"></div>
                </div>
            </div>
            
            <!-- 全息投影光环 -->
            <div class="hologram-rings">
                <div class="hologram-ring"></div>
                <div class="hologram-ring"></div>
                <div class="hologram-ring"></div>
            </div>
            
            <!-- 粒子效果容器 -->
            <div class="hologram-particles"></div>
        </div>
    `;
    
    // 初始化交互逻辑
    const robotInstance = new HologramRobot(container.querySelector('.robot-3d-container'));
    
    // 设置初始角色
    robotInstance.setRole(initialRole, true);
    
    return robotInstance;
}

// 导出到全局作用域
window.HologramRobot = HologramRobot;
window.createHologramRobot = createHologramRobot;
