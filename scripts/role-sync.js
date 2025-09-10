/* ==========================================
   角色同步管理器
   Role Synchronization Manager
   ========================================== */

/**
 * 角色同步管理器 - 管理机器人与角色选择器的双向同步
 */
class RoleSyncManager {
    constructor() {
        this.robotInstance = null;
        this.roleDropdown = null;
        this.chatManager = null;
        this.currentRole = 'assistant';
        
        this.init();
    }
    
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        // 初始化机器人
        this.initializeRobot();
        
        // 初始化角色选择器
        this.initializeRoleDropdown();
        
        // 等待聊天管理器加载
        this.waitForChatManager();
    }
    
    // 初始化机器人
    initializeRobot() {
        // 获取存储的当前角色
        const savedRole = localStorage.getItem('currentRole') || 'assistant';
        this.currentRole = savedRole;
        
        // 创建机器人实例
        if (typeof createHologramRobot === 'function') {
            this.robotInstance = createHologramRobot('mainRobot', savedRole);
            
            if (this.robotInstance) {
                // 监听机器人角色变化事件
                const robotContainer = document.querySelector('#mainRobot .robot-3d-container');
                if (robotContainer) {
                    robotContainer.addEventListener('roleChanged', (event) => {
                        this.onRobotRoleChanged(event.detail.newRole);
                    });
                }
                
                // 也监听机器人实例的容器事件
                if (this.robotInstance.container) {
                    this.robotInstance.container.addEventListener('roleChanged', (event) => {
                        this.onRobotRoleChanged(event.detail.newRole);
                    });
                }
                
                console.log('✅ 机器人初始化完成，当前角色:', savedRole);
            }
        } else {
            console.warn('⚠️ createHologramRobot 函数未找到，稍后重试...');
            // 延迟重试
            setTimeout(() => this.initializeRobot(), 1000);
        }
    }
    
    // 初始化角色选择器
    initializeRoleDropdown() {
        this.roleDropdown = {
            trigger: document.getElementById('roleDropdownTrigger'),
            menu: document.getElementById('roleDropdownMenu'),
            options: document.querySelectorAll('.role-option')
        };
        
        if (this.roleDropdown.trigger && this.roleDropdown.menu) {
            // 绑定角色选择器事件
            this.bindRoleDropdownEvents();
            
            // 设置初始角色状态
            this.updateRoleDropdownUI(this.currentRole);
            
            console.log('✅ 角色选择器初始化完成');
        } else {
            console.warn('⚠️ 角色选择器元素未找到');
        }
    }
    
    // 等待聊天管理器
    waitForChatManager() {
        const checkChatManager = () => {
            if (window.chatManager) {
                this.chatManager = window.chatManager;
                console.log('✅ 聊天管理器连接成功');
                
                // 同步初始角色到聊天管理器（使用fromSync=true避免循环）
                if (this.chatManager.switchRole) {
                    this.chatManager.switchRole(this.currentRole, true);
                }
            } else {
                setTimeout(checkChatManager, 500);
            }
        };
        
        checkChatManager();
    }
    
    // 绑定角色选择器事件
    bindRoleDropdownEvents() {
        // 下拉菜单触发器事件
        if (this.roleDropdown.trigger) {
            this.roleDropdown.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleRoleDropdown();
            });
        }
        
        // 角色选项点击事件
        this.roleDropdown.options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newRole = option.getAttribute('data-role');
                if (newRole && newRole !== this.currentRole) {
                    this.switchRole(newRole, 'dropdown');
                }
                this.closeRoleDropdown();
            });
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (this.roleDropdown.menu && 
                !this.roleDropdown.trigger.contains(e.target) && 
                !this.roleDropdown.menu.contains(e.target)) {
                this.closeRoleDropdown();
            }
        });
    }
    
    // 机器人角色变化处理
    onRobotRoleChanged(newRole) {
        console.log('🤖 机器人角色变化:', newRole);
        this.switchRole(newRole, 'robot');
    }
    
    // 统一角色切换方法
    switchRole(newRole, source = 'unknown') {
        if (this.currentRole === newRole) return;
        
        const oldRole = this.currentRole;
        this.currentRole = newRole;
        
        console.log(`🔄 角色切换: ${oldRole} → ${newRole} (来源: ${source})`);
        
        // 保存到本地存储
        localStorage.setItem('currentRole', newRole);
        
        // 同步到各个组件（避免循环触发）
        if (source !== 'robot' && this.robotInstance) {
            this.robotInstance.setRole(newRole, true); // 跳过动画，避免循环
        }
        
        if (source !== 'dropdown') {
            this.updateRoleDropdownUI(newRole);
        }
        
        if (source !== 'chat' && this.chatManager) {
            if (this.chatManager.switchRole) {
                this.chatManager.switchRole(newRole, true); // fromSync = true
            }
        }
        
        // 派发全局角色变化事件
        this.dispatchGlobalRoleChangeEvent(newRole, oldRole);
    }
    
    // 更新角色选择器UI
    updateRoleDropdownUI(role) {
        if (!this.roleDropdown.options) return;
        
        // 更新选中状态
        this.roleDropdown.options.forEach(option => {
            const isSelected = option.getAttribute('data-role') === role;
            option.classList.toggle('active', isSelected);
        });
        
        // 更新触发按钮显示
        const selectedOption = document.querySelector(`.role-option[data-role="${role}"]`);
        if (selectedOption && this.roleDropdown.trigger) {
            const nameElement = this.roleDropdown.trigger.querySelector('.role-current-name');
            const iconElement = this.roleDropdown.trigger.querySelector('.role-current-icon');
            
            if (nameElement) {
                const selectedName = selectedOption.querySelector('.role-option-name');
                if (selectedName) {
                    nameElement.textContent = selectedName.textContent;
                }
            }
            
            if (iconElement) {
                const selectedIcon = selectedOption.querySelector('.role-option-icon svg');
                if (selectedIcon) {
                    iconElement.innerHTML = selectedIcon.outerHTML;
                }
            }
        }
    }
    
    // 切换角色下拉菜单
    toggleRoleDropdown() {
        if (!this.roleDropdown.menu || !this.roleDropdown.trigger) return;
        
        const isExpanded = this.roleDropdown.trigger.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            this.closeRoleDropdown();
        } else {
            this.openRoleDropdown();
        }
    }
    
    // 打开角色下拉菜单
    openRoleDropdown() {
        if (!this.roleDropdown.menu || !this.roleDropdown.trigger) return;
        
        this.roleDropdown.trigger.setAttribute('aria-expanded', 'true');
        this.roleDropdown.menu.classList.add('show');
        this.roleDropdown.trigger.classList.add('active');
    }
    
    // 关闭角色下拉菜单
    closeRoleDropdown() {
        if (!this.roleDropdown.menu || !this.roleDropdown.trigger) return;
        
        this.roleDropdown.trigger.setAttribute('aria-expanded', 'false');
        this.roleDropdown.menu.classList.remove('show');
        this.roleDropdown.trigger.classList.remove('active');
    }
    
    // 派发全局角色变化事件
    dispatchGlobalRoleChangeEvent(newRole, oldRole) {
        const event = new CustomEvent('globalRoleChange', {
            detail: {
                newRole,
                oldRole,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // 获取当前角色
    getCurrentRole() {
        return this.currentRole;
    }
    
    // 外部API：切换角色
    setRole(role) {
        this.switchRole(role, 'external');
    }
    
    // 获取机器人实例
    getRobotInstance() {
        return this.robotInstance;
    }
}

// 创建全局实例
let roleSyncManager = null;

// 初始化函数
function initializeRoleSync() {
    if (!roleSyncManager) {
        roleSyncManager = new RoleSyncManager();
        window.roleSyncManager = roleSyncManager;
        console.log('🚀 角色同步管理器启动完成');
    }
    return roleSyncManager;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRoleSync);
} else {
    initializeRoleSync();
}

// 导出到全局作用域
window.RoleSyncManager = RoleSyncManager;
window.initializeRoleSync = initializeRoleSync;
