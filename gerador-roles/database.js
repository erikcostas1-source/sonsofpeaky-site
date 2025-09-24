/**
 * Database Manager - Gerador de Rolês
 * Gerenciamento de dados locais e sincronização com servidor
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'GeradorRoleesDB';
        this.dbVersion = 1;
        this.db = null;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        
        this.tables = {
            users: 'users',
            roteiros: 'roteiros',
            favorites: 'favorites',
            analytics: 'analytics',
            settings: 'settings',
            cache: 'cache',
            notifications: 'notifications',
            billing: 'billing'
        };
        
        this.initialize();
        this.setupOfflineSync();
    }

    async initialize() {
        try {
            this.db = await this.openDatabase();
            console.log('✅ Database inicializado');
            
            // Migrate existing localStorage data
            await this.migrateLocalStorageData();
            
            // Setup periodic sync
            this.setupPeriodicSync();
        } catch (error) {
            console.error('❌ Erro ao inicializar database:', error);
            // Fallback to localStorage
            this.useFallbackStorage();
        }
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Users table
                if (!db.objectStoreNames.contains(this.tables.users)) {
                    const userStore = db.createObjectStore(this.tables.users, { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('plan', 'plan');
                    userStore.createIndex('createdAt', 'createdAt');
                }
                
                // Roteiros table
                if (!db.objectStoreNames.contains(this.tables.roteiros)) {
                    const roteirosStore = db.createObjectStore(this.tables.roteiros, { keyPath: 'id' });
                    roteirosStore.createIndex('userId', 'userId');
                    roteirosStore.createIndex('createdAt', 'createdAt');
                    roteirosStore.createIndex('shared', 'shared');
                    roteirosStore.createIndex('rating', 'rating');
                }
                
                // Favorites table
                if (!db.objectStoreNames.contains(this.tables.favorites)) {
                    const favoritesStore = db.createObjectStore(this.tables.favorites, { keyPath: 'id' });
                    favoritesStore.createIndex('userId_roteiroId', ['userId', 'roteiroId'], { unique: true });
                }
                
                // Analytics table
                if (!db.objectStoreNames.contains(this.tables.analytics)) {
                    const analyticsStore = db.createObjectStore(this.tables.analytics, { keyPath: 'id' });
                    analyticsStore.createIndex('userId', 'userId');
                    analyticsStore.createIndex('event', 'event');
                    analyticsStore.createIndex('timestamp', 'timestamp');
                }
                
                // Settings table
                if (!db.objectStoreNames.contains(this.tables.settings)) {
                    const settingsStore = db.createObjectStore(this.tables.settings, { keyPath: 'userId' });
                }
                
                // Cache table
                if (!db.objectStoreNames.contains(this.tables.cache)) {
                    const cacheStore = db.createObjectStore(this.tables.cache, { keyPath: 'key' });
                    cacheStore.createIndex('expiry', 'expiry');
                }
                
                // Notifications table
                if (!db.objectStoreNames.contains(this.tables.notifications)) {
                    const notificationsStore = db.createObjectStore(this.tables.notifications, { keyPath: 'id' });
                    notificationsStore.createIndex('userId', 'userId');
                    notificationsStore.createIndex('read', 'read');
                    notificationsStore.createIndex('createdAt', 'createdAt');
                }
                
                // Billing table
                if (!db.objectStoreNames.contains(this.tables.billing)) {
                    const billingStore = db.createObjectStore(this.tables.billing, { keyPath: 'id' });
                    billingStore.createIndex('userId', 'userId');
                    billingStore.createIndex('status', 'status');
                    billingStore.createIndex('createdAt', 'createdAt');
                }
            };
        });
    }

    // User Management
    async saveUser(userData) {
        const user = {
            id: userData.id || this.generateId(),
            email: userData.email,
            name: userData.name,
            lastname: userData.lastname,
            phone: userData.phone,
            location: userData.location,
            bike: userData.bike,
            plan: userData.plan || 'FREE',
            avatar: userData.avatar,
            preferences: userData.preferences || {},
            settings: userData.settings || this.getDefaultSettings(),
            monthlyGenerationsUsed: userData.monthlyGenerationsUsed || 0,
            monthlyGenerationsLimit: this.getPlanLimit(userData.plan),
            lastLogin: new Date().toISOString(),
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verified: userData.verified || false,
            newsletter: userData.newsletter || false,
            syncStatus: 'pending'
        };

        try {
            await this.add(this.tables.users, user);
            this.addToSyncQueue('users', 'create', user);
            return user;
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            throw error;
        }
    }

    async getUser(userId) {
        try {
            return await this.get(this.tables.users, userId);
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
    }

    async getUserByEmail(email) {
        try {
            return await this.getByIndex(this.tables.users, 'email', email);
        } catch (error) {
            console.error('Erro ao obter usuário por email:', error);
            return null;
        }
    }

    async updateUser(userId, updates) {
        try {
            const user = await this.getUser(userId);
            if (!user) throw new Error('Usuário não encontrado');

            const updatedUser = {
                ...user,
                ...updates,
                updatedAt: new Date().toISOString(),
                syncStatus: 'pending'
            };

            await this.update(this.tables.users, updatedUser);
            this.addToSyncQueue('users', 'update', updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    // Roteiros Management
    async saveRoteiro(roteiroData) {
        const roteiro = {
            id: roteiroData.id || this.generateId(),
            userId: roteiroData.userId,
            title: roteiroData.title,
            description: roteiroData.description,
            destinos: roteiroData.destinos,
            custos: roteiroData.custos,
            distanciaTotal: roteiroData.distanciaTotal,
            tempoTotal: roteiroData.tempoTotal,
            dificuldade: roteiroData.dificuldade,
            parametros: roteiroData.parametros, // Parâmetros usados para gerar
            rating: roteiroData.rating || 0,
            shared: roteiroData.shared || false,
            public: roteiroData.public || false,
            tags: roteiroData.tags || [],
            images: roteiroData.images || [],
            weather: roteiroData.weather,
            createdAt: roteiroData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending'
        };

        try {
            await this.add(this.tables.roteiros, roteiro);
            this.addToSyncQueue('roteiros', 'create', roteiro);
            return roteiro;
        } catch (error) {
            console.error('Erro ao salvar roteiro:', error);
            throw error;
        }
    }

    async getUserRoteiros(userId, options = {}) {
        try {
            const roteiros = await this.getAllByIndex(this.tables.roteiros, 'userId', userId);
            
            // Apply filters
            let filtered = roteiros;
            
            if (options.search) {
                filtered = filtered.filter(r => 
                    r.title.toLowerCase().includes(options.search.toLowerCase()) ||
                    r.description.toLowerCase().includes(options.search.toLowerCase())
                );
            }
            
            if (options.tags && options.tags.length > 0) {
                filtered = filtered.filter(r => 
                    options.tags.some(tag => r.tags.includes(tag))
                );
            }
            
            if (options.rating) {
                filtered = filtered.filter(r => r.rating >= options.rating);
            }
            
            // Sort
            const sortBy = options.sortBy || 'createdAt';
            const sortOrder = options.sortOrder || 'desc';
            
            filtered.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];
                
                if (sortOrder === 'desc') {
                    return new Date(bVal) - new Date(aVal);
                } else {
                    return new Date(aVal) - new Date(bVal);
                }
            });
            
            // Pagination
            if (options.limit) {
                const offset = options.offset || 0;
                filtered = filtered.slice(offset, offset + options.limit);
            }
            
            return filtered;
        } catch (error) {
            console.error('Erro ao obter roteiros:', error);
            return [];
        }
    }

    // Analytics Management
    async trackEvent(eventData) {
        const event = {
            id: this.generateId(),
            userId: eventData.userId,
            event: eventData.event,
            data: eventData.data || {},
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            syncStatus: 'pending'
        };

        try {
            await this.add(this.tables.analytics, event);
            this.addToSyncQueue('analytics', 'create', event);
        } catch (error) {
            console.error('Erro ao rastrear evento:', error);
        }
    }

    async getAnalytics(userId, options = {}) {
        try {
            const events = await this.getAllByIndex(this.tables.analytics, 'userId', userId);
            
            // Filter by date range
            let filtered = events;
            if (options.startDate) {
                filtered = filtered.filter(e => e.timestamp >= options.startDate);
            }
            if (options.endDate) {
                filtered = filtered.filter(e => e.timestamp <= options.endDate);
            }
            
            // Group by event type if requested
            if (options.groupBy === 'event') {
                const grouped = {};
                filtered.forEach(event => {
                    if (!grouped[event.event]) {
                        grouped[event.event] = [];
                    }
                    grouped[event.event].push(event);
                });
                return grouped;
            }
            
            return filtered;
        } catch (error) {
            console.error('Erro ao obter analytics:', error);
            return [];
        }
    }

    // Settings Management
    async saveSettings(userId, settings) {
        const settingsData = {
            userId,
            ...settings,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending'
        };

        try {
            await this.addOrUpdate(this.tables.settings, settingsData);
            this.addToSyncQueue('settings', 'update', settingsData);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    }

    async getSettings(userId) {
        try {
            const settings = await this.get(this.tables.settings, userId);
            return settings || this.getDefaultSettings();
        } catch (error) {
            console.error('Erro ao obter configurações:', error);
            return this.getDefaultSettings();
        }
    }

    // Cache Management
    async setCache(key, data, expiryMinutes = 30) {
        const cacheData = {
            key,
            data,
            expiry: new Date(Date.now() + expiryMinutes * 60000).toISOString(),
            createdAt: new Date().toISOString()
        };

        try {
            await this.addOrUpdate(this.tables.cache, cacheData);
        } catch (error) {
            console.error('Erro ao salvar cache:', error);
        }
    }

    async getCache(key) {
        try {
            const cached = await this.get(this.tables.cache, key);
            
            if (!cached) return null;
            
            // Check if expired
            if (new Date(cached.expiry) < new Date()) {
                await this.delete(this.tables.cache, key);
                return null;
            }
            
            return cached.data;
        } catch (error) {
            console.error('Erro ao obter cache:', error);
            return null;
        }
    }

    async clearExpiredCache() {
        try {
            const allCache = await this.getAll(this.tables.cache);
            const now = new Date();
            
            for (const cached of allCache) {
                if (new Date(cached.expiry) < now) {
                    await this.delete(this.tables.cache, cached.key);
                }
            }
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
        }
    }

    // Generic CRUD operations
    async add(tableName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(tableName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(tableName, indexName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            const index = store.index(indexName);
            const request = index.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllByIndex(tableName, indexName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            const index = store.index(indexName);
            const request = index.getAll(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(tableName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readonly');
            const store = transaction.objectStore(tableName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(tableName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addOrUpdate(tableName, data) {
        try {
            const existing = await this.get(tableName, data[this.getKeyPath(tableName)]);
            if (existing) {
                return await this.update(tableName, data);
            } else {
                return await this.add(tableName, data);
            }
        } catch (error) {
            return await this.add(tableName, data);
        }
    }

    async delete(tableName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([tableName], 'readwrite');
            const store = transaction.objectStore(tableName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Sync Management
    setupOfflineSync() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Sync when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.syncPendingData();
            }
        });
    }

    setupPeriodicSync() {
        // Sync every 5 minutes if online
        setInterval(() => {
            if (this.isOnline) {
                this.syncPendingData();
                this.clearExpiredCache();
            }
        }, 5 * 60 * 1000);
    }

    addToSyncQueue(table, operation, data) {
        this.syncQueue.push({
            table,
            operation,
            data,
            timestamp: new Date().toISOString()
        });

        // Try to sync immediately if online
        if (this.isOnline) {
            this.syncPendingData();
        }
    }

    async syncPendingData() {
        if (this.syncQueue.length === 0) return;

        const authToken = localStorage.getItem('auth_token');
        if (!authToken) return;

        const batch = this.syncQueue.splice(0, 10); // Process in batches
        
        try {
            const response = await fetch(`${window.authManager?.apiBaseUrl}/sync/batch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ operations: batch })
            });

            if (response.ok) {
                console.log(`✅ Sincronizados ${batch.length} itens`);
            } else {
                // Return items to queue if sync failed
                this.syncQueue.unshift(...batch);
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
            // Return items to queue if sync failed
            this.syncQueue.unshift(...batch);
        }
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = this.generateId();
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    getKeyPath(tableName) {
        const keyPaths = {
            [this.tables.users]: 'id',
            [this.tables.roteiros]: 'id',
            [this.tables.favorites]: 'id',
            [this.tables.analytics]: 'id',
            [this.tables.settings]: 'userId',
            [this.tables.cache]: 'key',
            [this.tables.notifications]: 'id',
            [this.tables.billing]: 'id'
        };
        
        return keyPaths[tableName] || 'id';
    }

    getPlanLimit(plan) {
        const limits = {
            'FREE': 5,
            'PREMIUM': 50,
            'PRO': 200,
            'ENTERPRISE': -1
        };
        
        return limits[plan] || 5;
    }

    getDefaultSettings() {
        return {
            theme: 'dark',
            language: 'pt-BR',
            notifications: {
                email: true,
                push: true,
                marketing: false
            },
            privacy: {
                shareData: false,
                publicProfile: false
            },
            preferences: {
                defaultMoto: '',
                defaultLocation: '',
                preferredDistance: 200,
                preferredBudget: 300
            },
            ai: {
                creativity: 0.8,
                includeOffRoad: false,
                preferNature: true,
                avoidTolls: false
            }
        };
    }

    async migrateLocalStorageData() {
        try {
            // Migrate form data
            const formData = localStorage.getItem('gerador_form_data');
            if (formData) {
                const data = JSON.parse(formData);
                await this.setCache('last_form_data', data, 60 * 24); // 24 hours
            }

            // Migrate history
            const history = localStorage.getItem('gerador_history');
            if (history) {
                const historyData = JSON.parse(history);
                await this.setCache('generation_history', historyData, 60 * 24 * 7); // 7 days
            }

            // Migrate saved roteiros
            const savedRoteiros = localStorage.getItem('roteiros_salvos');
            if (savedRoteiros) {
                const roteiros = JSON.parse(savedRoteiros);
                for (const roteiro of roteiros) {
                    await this.saveRoteiro({
                        ...roteiro,
                        userId: 'local_user',
                        migrated: true
                    });
                }
            }

            console.log('✅ Dados migrados do localStorage');
        } catch (error) {
            console.error('Erro na migração:', error);
        }
    }

    useFallbackStorage() {
        console.log('⚠️ Usando localStorage como fallback');
        
        // Implement localStorage-based methods as fallback
        this.fallbackMode = true;
        
        this.add = async (table, data) => {
            const key = `${table}_${data.id}`;
            localStorage.setItem(key, JSON.stringify(data));
            return data.id;
        };
        
        this.get = async (table, id) => {
            const key = `${table}_${id}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        };
        
        // Add other fallback methods as needed
    }

    // Export/Import functions
    async exportUserData(userId) {
        try {
            const userData = await this.getUser(userId);
            const roteiros = await this.getUserRoteiros(userId);
            const settings = await this.getSettings(userId);
            const analytics = await this.getAnalytics(userId);

            const exportData = {
                user: userData,
                roteiros,
                settings,
                analytics,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            return exportData;
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            throw error;
        }
    }

    async importUserData(importData) {
        try {
            if (importData.user) {
                await this.saveUser(importData.user);
            }

            if (importData.roteiros) {
                for (const roteiro of importData.roteiros) {
                    await this.saveRoteiro(roteiro);
                }
            }

            if (importData.settings) {
                await this.saveSettings(importData.user.id, importData.settings);
            }

            console.log('✅ Dados importados com sucesso');
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            throw error;
        }
    }

    // Statistics
    async getStatistics(userId) {
        try {
            const roteiros = await this.getUserRoteiros(userId);
            const analytics = await this.getAnalytics(userId);
            
            const stats = {
                totalRoteiros: roteiros.length,
                totalKilometers: roteiros.reduce((total, r) => total + (parseInt(r.distanciaTotal) || 0), 0),
                avgRating: roteiros.reduce((total, r) => total + (r.rating || 0), 0) / roteiros.length || 0,
                totalGenerations: analytics.filter(e => e.event === 'roteiro_generated').length,
                mostUsedTags: this.getMostUsedTags(roteiros),
                activityByMonth: this.getActivityByMonth(analytics),
                favoriteDestinations: this.getFavoriteDestinations(roteiros)
            };

            return stats;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {};
        }
    }

    getMostUsedTags(roteiros) {
        const tagCount = {};
        roteiros.forEach(roteiro => {
            roteiro.tags?.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });
        
        return Object.entries(tagCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }

    getActivityByMonth(analytics) {
        const monthlyActivity = {};
        analytics.forEach(event => {
            const month = event.timestamp.substring(0, 7); // YYYY-MM
            monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
        });
        
        return monthlyActivity;
    }

    getFavoriteDestinations(roteiros) {
        const destinationCount = {};
        roteiros.forEach(roteiro => {
            roteiro.destinos?.forEach(destino => {
                const city = destino.cidade || destino.nome;
                destinationCount[city] = (destinationCount[city] || 0) + 1;
            });
        });
        
        return Object.entries(destinationCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([destination, count]) => ({ destination, count }));
    }
}

// Initialize Database Manager
const dbManager = new DatabaseManager();

// Export for global access
window.dbManager = dbManager;

console.log('✅ Database Manager carregado');