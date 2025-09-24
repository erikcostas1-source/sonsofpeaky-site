/**
 * Sistema de Configurações Avançadas
 * Gerador de Rolês - Configurações do usuário, AI, interface e privacidade
 */

class SettingsManager {
    constructor() {
        this.settings = {};
        this.defaultSettings = {
            // Configurações de AI
            ai: {
                preset: 'balanced',
                creativity: 80,
                distance: 200,
                budget: 300,
                includeOffRoad: false,
                preferNature: true,
                avoidTolls: false,
                includeTourism: true,
                preferredRegions: ['sudeste', 'sul'],
                destinationTypes: ['praias', 'montanhas', 'cidades-historicas'],
                considerSeason: true,
                avoidHighSeason: false,
                includeWeather: true
            },
            
            // Configurações de Interface
            interface: {
                theme: 'light',
                accentColor: '#2563eb',
                alwaysShowSidebar: false,
                enableAnimations: true,
                compactMode: false,
                mapProvider: 'google',
                showTraffic: true,
                satelliteMode: false,
                language: 'pt-BR',
                dateFormat: 'dd/mm/yyyy',
                currency: 'BRL'
            },
            
            // Configurações de Notificações
            notifications: {
                email: {
                    savedRoutes: true,
                    newDestinations: true,
                    planUpdates: true,
                    newsletter: false
                },
                push: {
                    generationComplete: true,
                    limitReached: true,
                    personalizedSuggestions: false
                },
                frequency: {
                    weeklyDigest: 'weekly',
                    dayOfWeek: 'monday',
                    time: '09:00'
                },
                doNotDisturb: {
                    enabled: false,
                    startTime: '22:00',
                    endTime: '08:00'
                }
            },
            
            // Configurações de Privacidade
            privacy: {
                publicProfile: false,
                shareRoteiros: false,
                usageAnalytics: true,
                personalization: true,
                cookies: {
                    essential: true,
                    analytics: true,
                    marketing: false
                },
                twoFactor: false
            },
            
            // Informações da Conta
            account: {
                name: '',
                email: '',
                phone: '',
                location: '',
                bike: ''
            }
        };
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.populateForm();
        this.loadUserStats();
    }

    async loadSettings() {
        try {
            const savedSettings = await this.getFromStorage('userSettings');
            this.settings = { ...this.defaultSettings, ...savedSettings };
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            this.settings = { ...this.defaultSettings };
        }
    }

    async saveSettings() {
        try {
            await this.saveToStorage('userSettings', this.settings);
            this.showNotification('Configurações salvas com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações', 'error');
            return false;
        }
    }

    setupEventListeners() {
        // Navegação entre tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Botões de ação
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveAllSettings();
        });

        document.getElementById('resetAllBtn').addEventListener('click', () => {
            this.showResetConfirmation();
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            this.goBack();
        });

        // AI Presets
        document.querySelectorAll('.ai-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                this.selectAIPreset(e.currentTarget.dataset.preset);
            });
        });

        // Range sliders
        this.setupRangeSliders();

        // Toggle switches
        this.setupToggleSwitches();

        // Color pickers
        this.setupColorPickers();

        // Form inputs
        this.setupFormInputs();

        // Notification settings
        this.setupNotificationSettings();

        // Privacy controls
        this.setupPrivacyControls();

        // Account management
        this.setupAccountManagement();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}Tab`).classList.remove('hidden');
        document.getElementById(`${tabName}Tab`).classList.add('fade-in');
    }

    selectAIPreset(presetName) {
        // Update visual selection
        document.querySelectorAll('.ai-preset').forEach(preset => {
            preset.classList.remove('selected');
        });
        document.querySelector(`[data-preset="${presetName}"]`).classList.add('selected');

        // Apply preset settings
        this.applyAIPreset(presetName);
        this.settings.ai.preset = presetName;
    }

    applyAIPreset(presetName) {
        const presets = {
            balanced: {
                creativity: 80,
                distance: 200,
                budget: 300,
                includeOffRoad: false,
                preferNature: true,
                avoidTolls: false,
                includeTourism: true
            },
            adventure: {
                creativity: 95,
                distance: 400,
                budget: 500,
                includeOffRoad: true,
                preferNature: true,
                avoidTolls: true,
                includeTourism: false
            },
            comfort: {
                creativity: 60,
                distance: 150,
                budget: 600,
                includeOffRoad: false,
                preferNature: false,
                avoidTolls: false,
                includeTourism: true
            },
            economic: {
                creativity: 70,
                distance: 100,
                budget: 150,
                includeOffRoad: false,
                preferNature: true,
                avoidTolls: true,
                includeTourism: false
            }
        };

        const preset = presets[presetName];
        if (preset) {
            // Update sliders
            this.updateSlider('creativity', preset.creativity);
            this.updateSlider('distance', preset.distance);
            this.updateSlider('budget', preset.budget);

            // Update toggles
            this.updateToggle('includeOffRoad', preset.includeOffRoad);
            this.updateToggle('preferNature', preset.preferNature);
            this.updateToggle('avoidTolls', preset.avoidTolls);
            this.updateToggle('includeTourism', preset.includeTourism);

            // Update settings object
            Object.assign(this.settings.ai, preset);
        }
    }

    setupRangeSliders() {
        const sliders = [
            { id: 'creativity', valueId: 'creativityValue', suffix: '%' },
            { id: 'distance', valueId: 'distanceValue', suffix: ' km' },
            { id: 'budget', valueId: 'budgetValue', prefix: 'R$ ' }
        ];

        sliders.forEach(({ id, valueId, prefix = '', suffix = '' }) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(valueId);

            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    valueDisplay.textContent = `${prefix}${value}${suffix}`;
                    this.settings.ai[id] = parseInt(value);
                });
            }
        });
    }

    setupToggleSwitches() {
        const aiToggles = [
            'includeOffRoad', 'preferNature', 'avoidTolls', 'includeTourism',
            'considerSeason', 'avoidHighSeason', 'includeWeather'
        ];

        const interfaceToggles = [
            'alwaysShowSidebar', 'enableAnimations', 'compactMode',
            'showTraffic', 'satelliteMode'
        ];

        const privacyToggles = [
            'publicProfile', 'shareRoteiros', 'usageAnalytics', 
            'personalization', 'twoFactor'
        ];

        // AI toggles
        aiToggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.settings.ai[toggleId] = e.target.checked;
                });
            }
        });

        // Interface toggles
        interfaceToggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.settings.interface[toggleId] = e.target.checked;
                    this.applyInterfaceChanges(toggleId, e.target.checked);
                });
            }
        });

        // Privacy toggles
        privacyToggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.settings.privacy[toggleId] = e.target.checked;
                });
            }
        });
    }

    setupColorPickers() {
        document.querySelectorAll('.color-picker input').forEach(colorInput => {
            colorInput.addEventListener('change', (e) => {
                this.settings.interface.accentColor = e.target.value;
                this.applyColorTheme(e.target.value);
            });
        });
    }

    setupFormInputs() {
        // Theme selection
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.settings.interface.theme = e.target.value;
                this.applyTheme(e.target.value);
            });
        });

        // Select dropdowns
        const selects = [
            { id: 'mapProvider', setting: 'interface.mapProvider' },
            { id: 'language', setting: 'interface.language' },
            { id: 'dateFormat', setting: 'interface.dateFormat' },
            { id: 'currency', setting: 'interface.currency' }
        ];

        selects.forEach(({ id, setting }) => {
            const select = document.querySelector(`select[id*="${id}"]`);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.setNestedSetting(setting, e.target.value);
                });
            }
        });

        // Account info inputs
        const accountInputs = ['userName', 'userEmail', 'userPhone', 'userLocation', 'userBike'];
        accountInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', (e) => {
                    const field = inputId.replace('user', '').toLowerCase();
                    this.settings.account[field] = e.target.value;
                });
            }
        });
    }

    setupNotificationSettings() {
        // Email notifications
        const emailNotifications = [
            'savedRoutes', 'newDestinations', 'planUpdates', 'newsletter'
        ];

        emailNotifications.forEach(notifId => {
            const toggle = document.querySelector(`#${notifId}, [data-notification="email-${notifId}"]`);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.settings.notifications.email[notifId] = e.target.checked;
                });
            }
        });

        // Push notifications
        const pushNotifications = [
            'generationComplete', 'limitReached', 'personalizedSuggestions'
        ];

        pushNotifications.forEach(notifId => {
            const toggle = document.querySelector(`[data-notification="push-${notifId}"]`);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.settings.notifications.push[notifId] = e.target.checked;
                });
            }
        });

        // Do not disturb
        const dndToggle = document.getElementById('doNotDisturb');
        if (dndToggle) {
            dndToggle.addEventListener('change', (e) => {
                this.settings.notifications.doNotDisturb.enabled = e.target.checked;
            });
        }

        // Enable push notifications button
        const enablePushBtn = document.querySelector('button[onclick*="notifications"]');
        if (enablePushBtn) {
            enablePushBtn.addEventListener('click', () => {
                this.enablePushNotifications();
            });
        }
    }

    setupPrivacyControls() {
        // Data control buttons
        const downloadBtn = document.querySelector('button:has(span:contains("Baixar meus dados"))');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadUserData();
            });
        }

        const clearHistoryBtn = document.querySelector('button:has(span:contains("Limpar histórico"))');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.showClearHistoryConfirmation();
            });
        }

        const deleteAccountBtn = document.querySelector('button:has(span:contains("Excluir conta"))');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                this.showDeleteAccountConfirmation();
            });
        }

        // Cookie settings
        const cookieToggles = ['analyticsCookies', 'marketingCookies'];
        cookieToggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    const cookieType = toggleId.replace('Cookies', '');
                    this.settings.privacy.cookies[cookieType] = e.target.checked;
                });
            }
        });
    }

    setupAccountManagement() {
        // Upgrade button
        const upgradeBtn = document.querySelector('button:contains("Fazer Upgrade")');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.openUpgradeModal();
            });
        }

        // View all plans button
        const plansBtn = document.querySelector('button:contains("Ver Todos os Planos")');
        if (plansBtn) {
            plansBtn.addEventListener('click', () => {
                this.openPlansModal();
            });
        }

        // Change password button
        const changePasswordBtn = document.querySelector('button:has(span:contains("Alterar senha"))');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.openChangePasswordModal();
            });
        }

        // Active sessions button
        const sessionsBtn = document.querySelector('button:has(span:contains("Sessões ativas"))');
        if (sessionsBtn) {
            sessionsBtn.addEventListener('click', () => {
                this.openActiveSessionsModal();
            });
        }
    }

    populateForm() {
        // AI settings
        this.updateSlider('creativity', this.settings.ai.creativity);
        this.updateSlider('distance', this.settings.ai.distance);
        this.updateSlider('budget', this.settings.ai.budget);

        // AI toggles
        const aiToggles = [
            'includeOffRoad', 'preferNature', 'avoidTolls', 'includeTourism',
            'considerSeason', 'avoidHighSeason', 'includeWeather'
        ];
        aiToggles.forEach(toggleId => {
            this.updateToggle(toggleId, this.settings.ai[toggleId]);
        });

        // Interface settings
        this.updateRadio('theme', this.settings.interface.theme);
        
        const interfaceToggles = [
            'alwaysShowSidebar', 'enableAnimations', 'compactMode',
            'showTraffic', 'satelliteMode'
        ];
        interfaceToggles.forEach(toggleId => {
            this.updateToggle(toggleId, this.settings.interface[toggleId]);
        });

        // Account information
        const accountFields = {
            userName: this.settings.account.name,
            userEmail: this.settings.account.email,
            userPhone: this.settings.account.phone,
            userLocation: this.settings.account.location,
            userBike: this.settings.account.bike
        };

        Object.entries(accountFields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) field.value = value || '';
        });

        // AI preset selection
        document.querySelector(`[data-preset="${this.settings.ai.preset}"]`)?.classList.add('selected');
    }

    updateSlider(sliderId, value) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(`${sliderId}Value`);
        
        if (slider) {
            slider.value = value;
            
            if (valueDisplay) {
                let displayValue = value;
                if (sliderId === 'creativity') displayValue = `${value}%`;
                if (sliderId === 'distance') displayValue = `${value} km`;
                if (sliderId === 'budget') displayValue = `R$ ${value}`;
                
                valueDisplay.textContent = displayValue;
            }
        }
    }

    updateToggle(toggleId, checked) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.checked = checked;
        }
    }

    updateRadio(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
        }
    }

    async saveAllSettings() {
        // Collect all current form values
        this.collectFormData();
        
        // Save to storage
        const success = await this.saveSettings();
        
        if (success) {
            // Apply settings immediately
            this.applySettings();
        }
    }

    collectFormData() {
        // This method collects all current form values into this.settings
        // Implementation would gather values from all form elements
        
        // AI settings are already updated via event listeners
        // Interface settings are already updated via event listeners
        // Account settings are already updated via event listeners
        
        console.log('Settings collected:', this.settings);
    }

    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.interface.theme);
        
        // Apply color theme
        this.applyColorTheme(this.settings.interface.accentColor);
        
        // Apply interface preferences
        this.applyInterfacePreferences();
        
        // Update UI based on settings
        this.updateUI();
    }

    applyTheme(theme) {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        
        body.classList.add(`theme-${theme}`);
    }

    applyColorTheme(color) {
        document.documentElement.style.setProperty('--primary', color);
    }

    applyInterfacePreferences() {
        const { enableAnimations, compactMode } = this.settings.interface;
        
        document.body.classList.toggle('no-animations', !enableAnimations);
        document.body.classList.toggle('compact-mode', compactMode);
    }

    applyInterfaceChanges(setting, value) {
        switch (setting) {
            case 'enableAnimations':
                document.body.classList.toggle('no-animations', !value);
                break;
            case 'compactMode':
                document.body.classList.toggle('compact-mode', value);
                break;
            case 'alwaysShowSidebar':
                // Toggle sidebar visibility
                break;
        }
    }

    async loadUserStats() {
        try {
            // Load user statistics from database
            const user = await auth.getCurrentUser();
            if (user) {
                // Update plan display
                document.getElementById('currentPlan').textContent = user.plan?.toUpperCase() || 'FREE';
                
                // Update generations used
                const planLimits = {
                    free: 5,
                    premium: 50,
                    pro: 200,
                    enterprise: -1 // unlimited
                };
                
                const limit = planLimits[user.plan] || 5;
                const used = user.generationsThisMonth || 0;
                
                document.getElementById('generationsUsed').textContent = 
                    limit === -1 ? `${used} / Ilimitado` : `${used} / ${limit}`;
                
                // Update progress bar
                if (limit !== -1) {
                    const percentage = (used / limit) * 100;
                    document.getElementById('generationsProgress').style.width = `${percentage}%`;
                }
                
                // Update stats
                document.getElementById('totalGenerations').textContent = user.totalGenerations || 0;
                document.getElementById('totalKm').textContent = this.formatNumber(user.totalKm || 0);
                document.getElementById('favoriteDestinations').textContent = user.favoriteDestinations?.length || 0;
                
                // Calculate member since
                const memberSince = new Date(user.createdAt);
                const monthsSince = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30));
                document.getElementById('memberSince').textContent = monthsSince;
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    async enablePushNotifications() {
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.showNotification('Notificações habilitadas com sucesso!', 'success');
                } else {
                    this.showNotification('Permissão para notificações negada', 'warning');
                }
            } else {
                this.showNotification('Seu navegador não suporta notificações', 'error');
            }
        } catch (error) {
            console.error('Erro ao habilitar notificações:', error);
            this.showNotification('Erro ao habilitar notificações', 'error');
        }
    }

    async downloadUserData() {
        try {
            const userData = {
                settings: this.settings,
                profile: await auth.getCurrentUser(),
                history: await db.getUserHistory(),
                favorites: await db.getUserFavorites(),
                statistics: await db.getUserStatistics()
            };
            
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `gerador-roles-dados-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Dados baixados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao baixar dados:', error);
            this.showNotification('Erro ao baixar dados', 'error');
        }
    }

    showResetConfirmation() {
        if (confirm('Tem certeza que deseja resetar todas as configurações? Esta ação não pode ser desfeita.')) {
            this.resetAllSettings();
        }
    }

    showClearHistoryConfirmation() {
        if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
            this.clearUserHistory();
        }
    }

    showDeleteAccountConfirmation() {
        const confirmed = prompt('Digite "EXCLUIR" para confirmar a exclusão da conta:');
        if (confirmed === 'EXCLUIR') {
            this.deleteUserAccount();
        }
    }

    async resetAllSettings() {
        try {
            this.settings = { ...this.defaultSettings };
            await this.saveSettings();
            this.populateForm();
            this.applySettings();
            this.showNotification('Configurações resetadas com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao resetar configurações:', error);
            this.showNotification('Erro ao resetar configurações', 'error');
        }
    }

    async clearUserHistory() {
        try {
            await db.clearUserHistory();
            this.showNotification('Histórico limpo com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao limpar histórico:', error);
            this.showNotification('Erro ao limpar histórico', 'error');
        }
    }

    async deleteUserAccount() {
        try {
            await auth.deleteAccount();
            this.showNotification('Conta excluída com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            this.showNotification('Erro ao excluir conta', 'error');
        }
    }

    openUpgradeModal() {
        // Implementation would open payment modal
        window.location.href = 'payment.html?action=upgrade';
    }

    openPlansModal() {
        // Implementation would open plans comparison modal
        window.location.href = 'payment.html';
    }

    openChangePasswordModal() {
        // Implementation would open change password modal
        console.log('Open change password modal');
    }

    openActiveSessionsModal() {
        // Implementation would open active sessions modal
        console.log('Open active sessions modal');
    }

    goBack() {
        // Check if there's a referrer or go to main page
        if (document.referrer) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    setNestedSetting(path, value) {
        const keys = path.split('.');
        let current = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    updateUI() {
        // Update any UI elements based on current settings
        console.log('UI updated with settings:', this.settings);
    }

    // Storage helpers
    async getFromStorage(key) {
        if (typeof window.db !== 'undefined') {
            return await db.getUserSettings();
        } else {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
    }

    async saveToStorage(key, data) {
        if (typeof window.db !== 'undefined') {
            return await db.saveUserSettings(data);
        } else {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        }
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationClasses(type)}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getNotificationClasses(type) {
        const classes = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        return classes[type] || classes.info;
    }
}

// Initialize settings manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
}