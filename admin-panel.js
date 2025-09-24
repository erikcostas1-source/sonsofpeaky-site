/**
 * Admin Panel JavaScript - Gerador de Rolês
 * Painel administrativo completo para gerenciamento do sistema
 */

class AdminPanel {
    constructor() {
        this.currentView = 'dashboard';
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.charts = {};
        this.isLoading = false;
        
        this.initialize();
    }

    async initialize() {
        // Check admin authentication
        if (!await this.checkAdminAuth()) {
            this.redirectToLogin();
            return;
        }

        this.setupEventListeners();
        this.setupSidebar();
        this.loadDashboard();
    }

    async checkAdminAuth() {
        const user = await window.authManager?.getCurrentUser();
        return user && (user.role === 'admin' || user.role === 'super_admin');
    }

    redirectToLogin() {
        window.location.href = 'index.html?admin=true';
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('href').substring(1);
                this.switchView(view);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshCurrentView();
        });

        // Search and filters
        document.getElementById('userSearch')?.addEventListener('input', 
            this.debounce(() => this.filterUsers(), 300)
        );

        document.getElementById('userFilter')?.addEventListener('change', () => {
            this.filterUsers();
        });

        // Period selectors
        document.getElementById('plansPeriod')?.addEventListener('change', () => {
            this.updatePlansChart();
        });

        document.getElementById('growthPeriod')?.addEventListener('change', () => {
            this.updateGrowthChart();
        });

        // Export buttons
        document.getElementById('exportUsers')?.addEventListener('click', () => {
            this.exportUsers();
        });

        // Pagination
        document.getElementById('usersPrevious')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadUsers();
            }
        });

        document.getElementById('usersNext')?.addEventListener('click', () => {
            this.currentPage++;
            this.loadUsers();
        });
    }

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        // Responsive sidebar
        if (window.innerWidth < 1024) {
            sidebar.classList.add('sidebar-collapsed');
            mainContent.classList.remove('ml-64');
            mainContent.classList.add('ml-20');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        sidebar.classList.toggle('sidebar-collapsed');
        
        if (sidebar.classList.contains('sidebar-collapsed')) {
            mainContent.classList.remove('ml-64');
            mainContent.classList.add('ml-20');
        } else {
            mainContent.classList.remove('ml-20');
            mainContent.classList.add('ml-64');
        }
    }

    switchView(view) {
        // Hide all views
        document.querySelectorAll('[id$="View"]').forEach(viewEl => {
            viewEl.classList.add('hidden');
        });

        // Show selected view
        const viewElement = document.getElementById(`${view}View`);
        if (viewElement) {
            viewElement.classList.remove('hidden');
            this.currentView = view;
            
            // Update page title
            const titles = {
                dashboard: { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
                users: { title: 'Usuários', subtitle: 'Gerenciar contas de usuário' },
                content: { title: 'Conteúdo', subtitle: 'Gerenciar roteiros e moderação' },
                billing: { title: 'Faturamento', subtitle: 'Receitas e transações' },
                analytics: { title: 'Analytics', subtitle: 'Métricas e relatórios' },
                settings: { title: 'Configurações', subtitle: 'Configurações do sistema' },
                support: { title: 'Suporte', subtitle: 'Tickets e atendimento' }
            };

            const pageInfo = titles[view] || { title: view, subtitle: '' };
            document.getElementById('pageTitle').textContent = pageInfo.title;
            document.getElementById('pageSubtitle').textContent = pageInfo.subtitle;

            // Update sidebar active state
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('bg-gray-700', 'text-white');
                if (item.getAttribute('href') === `#${view}`) {
                    item.classList.add('bg-gray-700', 'text-white');
                }
            });

            // Load view data
            this.loadViewData(view);
        }
    }

    async loadViewData(view) {
        this.showLoading();

        try {
            switch (view) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'users':
                    await this.loadUsers();
                    break;
                case 'content':
                    await this.loadContent();
                    break;
                case 'billing':
                    await this.loadBilling();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
                case 'settings':
                    await this.loadSettings();
                    break;
                case 'support':
                    await this.loadSupport();
                    break;
            }
        } catch (error) {
            console.error(`Erro ao carregar ${view}:`, error);
            this.showNotification('Erro ao carregar dados', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadDashboard() {
        const metrics = await this.fetchMetrics();
        this.updateMetrics(metrics);
        this.updateCharts();
        this.loadRecentActivity();
    }

    async fetchMetrics() {
        try {
            // Simulate API call - replace with actual backend
            const users = await window.dbManager?.getAll('users') || [];
            const roteiros = await window.dbManager?.getAll('roteiros') || [];
            
            const totalUsers = users.length;
            const totalRoteiros = roteiros.length;
            
            // Calculate monthly growth
            const thisMonth = new Date().toISOString().substring(0, 7);
            const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7);
            
            const thisMonthUsers = users.filter(u => u.createdAt?.startsWith(thisMonth)).length;
            const lastMonthUsers = users.filter(u => u.createdAt?.startsWith(lastMonth)).length;
            
            const userGrowth = lastMonthUsers > 0 ? 
                Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0;

            // Plan distribution
            const planCounts = {
                FREE: users.filter(u => u.plan === 'FREE').length,
                PREMIUM: users.filter(u => u.plan === 'PREMIUM').length,
                PRO: users.filter(u => u.plan === 'PRO').length,
                ENTERPRISE: users.filter(u => u.plan === 'ENTERPRISE').length
            };

            // Revenue calculation (mock)
            const monthlyRevenue = planCounts.PREMIUM * 19.90 + 
                                  planCounts.PRO * 49.90 + 
                                  planCounts.ENTERPRISE * 199.90;

            // Conversion rate (mock)
            const freeUsers = planCounts.FREE;
            const paidUsers = totalUsers - freeUsers;
            const conversionRate = totalUsers > 0 ? 
                Math.round((paidUsers / totalUsers) * 100) : 0;

            return {
                totalUsers,
                totalRoteiros,
                monthlyRevenue,
                conversionRate,
                userGrowth,
                planCounts,
                roteiroGrowth: 15, // Mock data
                revenueGrowth: 23, // Mock data
                conversionGrowth: 8 // Mock data
            };
        } catch (error) {
            console.error('Erro ao buscar métricas:', error);
            return this.getDefaultMetrics();
        }
    }

    updateMetrics(metrics) {
        document.getElementById('totalUsers').textContent = metrics.totalUsers.toLocaleString();
        document.getElementById('totalRoteiros').textContent = metrics.totalRoteiros.toLocaleString();
        document.getElementById('monthlyRevenue').textContent = 
            `R$ ${metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        document.getElementById('conversionRate').textContent = `${metrics.conversionRate}%`;

        // Growth indicators
        document.getElementById('userGrowth').textContent = `${metrics.userGrowth >= 0 ? '+' : ''}${metrics.userGrowth}%`;
        document.getElementById('roteiroGrowth').textContent = `+${metrics.roteiroGrowth}%`;
        document.getElementById('revenueGrowth').textContent = `+${metrics.revenueGrowth}%`;
        document.getElementById('conversionGrowth').textContent = `+${metrics.conversionGrowth}%`;
    }

    async updateCharts() {
        this.updatePlansChart();
        this.updateGrowthChart();
    }

    async updatePlansChart() {
        const metrics = await this.fetchMetrics();
        const ctx = document.getElementById('plansChart');
        
        if (this.charts.plans) {
            this.charts.plans.destroy();
        }

        this.charts.plans = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['FREE', 'PREMIUM', 'PRO', 'ENTERPRISE'],
                datasets: [{
                    data: [
                        metrics.planCounts.FREE,
                        metrics.planCounts.PREMIUM,
                        metrics.planCounts.PRO,
                        metrics.planCounts.ENTERPRISE
                    ],
                    backgroundColor: [
                        '#64748b',
                        '#2563eb',
                        '#10b981',
                        '#f59e0b'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    async updateGrowthChart() {
        const period = document.getElementById('growthPeriod').value;
        const growthData = await this.fetchGrowthData(period);
        
        const ctx = document.getElementById('growthChart');
        
        if (this.charts.growth) {
            this.charts.growth.destroy();
        }

        this.charts.growth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: growthData.labels,
                datasets: [{
                    label: 'Novos Usuários',
                    data: growthData.data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async fetchGrowthData(period) {
        // Mock growth data - replace with actual backend call
        const labels = [];
        const data = [];
        
        for (let i = parseInt(period) - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
            data.push(Math.floor(Math.random() * 10) + 1);
        }

        return { labels, data };
    }

    async loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        
        try {
            // Mock activity data - replace with actual backend call
            const activities = [
                {
                    type: 'user_registered',
                    message: 'Novo usuário cadastrado: João Silva',
                    time: '2 minutos atrás',
                    icon: 'user-plus',
                    color: 'text-green-600'
                },
                {
                    type: 'roteiro_generated',
                    message: 'Roteiro gerado: "Rota das Cachoeiras"',
                    time: '5 minutos atrás',
                    icon: 'map',
                    color: 'text-blue-600'
                },
                {
                    type: 'payment_received',
                    message: 'Pagamento recebido: R$ 49,90 (Plano PRO)',
                    time: '15 minutos atrás',
                    icon: 'credit-card',
                    color: 'text-yellow-600'
                },
                {
                    type: 'support_ticket',
                    message: 'Novo ticket de suporte #1234',
                    time: '1 hora atrás',
                    icon: 'help-circle',
                    color: 'text-purple-600'
                }
            ];

            const activityHtml = activities.map(activity => `
                <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4 ${activity.color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${this.getActivityIcon(activity.icon)}
                            </svg>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-gray-900">${activity.message}</p>
                        <p class="text-xs text-gray-500">${activity.time}</p>
                    </div>
                </div>
            `).join('');

            activityContainer.innerHTML = activityHtml;
        } catch (error) {
            activityContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500">Erro ao carregar atividades</p>
                </div>
            `;
        }
    }

    async loadUsers() {
        const usersTable = document.getElementById('usersTable');
        
        try {
            const users = await window.dbManager?.getAll('users') || [];
            
            // Apply filters
            const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
            const planFilter = document.getElementById('userFilter')?.value || '';
            
            let filteredUsers = users.filter(user => {
                const matchesSearch = !searchTerm || 
                    user.name?.toLowerCase().includes(searchTerm) ||
                    user.email?.toLowerCase().includes(searchTerm);
                
                const matchesPlan = !planFilter || user.plan === planFilter;
                
                return matchesSearch && matchesPlan;
            });

            // Pagination
            const totalUsers = filteredUsers.length;
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            // Update pagination info
            document.getElementById('usersShowing').textContent = 
                `${startIndex + 1}-${Math.min(endIndex, totalUsers)}`;
            document.getElementById('usersTotal').textContent = totalUsers;

            // Update pagination buttons
            document.getElementById('usersPrevious').disabled = this.currentPage === 1;
            document.getElementById('usersNext').disabled = endIndex >= totalUsers;

            // Render users table
            const usersHtml = paginatedUsers.map(user => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3 px-4">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                <span class="text-white text-sm font-bold">
                                    ${(user.name || user.email || '?').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">${user.name || 'N/A'}</p>
                                <p class="text-sm text-gray-500">${user.phone || ''}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4 text-gray-900">${user.email}</td>
                    <td class="py-3 px-4">
                        <span class="status-badge ${this.getPlanBadgeClass(user.plan)}">
                            ${user.plan || 'FREE'}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <span class="status-badge ${user.verified ? 'status-active' : 'status-pending'}">
                            ${user.verified ? 'Ativo' : 'Pendente'}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-gray-600">
                        ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex space-x-2">
                            <button onclick="adminPanel.viewUser('${user.id}')" 
                                    class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Ver
                            </button>
                            <button onclick="adminPanel.editUser('${user.id}')" 
                                    class="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                                Editar
                            </button>
                            <button onclick="adminPanel.toggleUserStatus('${user.id}')" 
                                    class="text-red-600 hover:text-red-700 text-sm font-medium">
                                ${user.verified ? 'Suspender' : 'Ativar'}
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            usersTable.innerHTML = usersHtml || `
                <tr>
                    <td colspan="6" class="py-8 text-center text-gray-500">
                        Nenhum usuário encontrado
                    </td>
                </tr>
            `;

        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            usersTable.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-red-500">
                        Erro ao carregar usuários
                    </td>
                </tr>
            `;
        }
    }

    async loadContent() {
        await this.loadRecentRoteiros();
        await this.loadContentStats();
        await this.loadModerationQueue();
    }

    async loadRecentRoteiros() {
        const container = document.getElementById('recentRoteiros');
        
        try {
            const roteiros = await window.dbManager?.getAll('roteiros') || [];
            const recentRoteiros = roteiros
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);

            const roteirosHtml = recentRoteiros.map(roteiro => `
                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-900">${roteiro.title || 'Roteiro sem título'}</h4>
                        <span class="text-xs text-gray-500">
                            ${roteiro.createdAt ? new Date(roteiro.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">${roteiro.description || 'Sem descrição'}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex space-x-4 text-xs text-gray-500">
                            <span>⭐ ${roteiro.rating || 0}/5</span>
                            <span>📍 ${roteiro.destinos?.length || 0} destinos</span>
                            <span>💰 R$ ${roteiro.custos?.total || 0}</span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="adminPanel.viewRoteiro('${roteiro.id}')" 
                                    class="text-blue-600 hover:text-blue-700 text-xs font-medium">
                                Ver
                            </button>
                            <button onclick="adminPanel.moderateRoteiro('${roteiro.id}')" 
                                    class="text-yellow-600 hover:text-yellow-700 text-xs font-medium">
                                Moderar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = roteirosHtml || `
                <div class="text-center py-8 text-gray-500">
                    Nenhum roteiro encontrado
                </div>
            `;

        } catch (error) {
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    Erro ao carregar roteiros
                </div>
            `;
        }
    }

    async loadContentStats() {
        const container = document.getElementById('contentStats');
        
        try {
            const roteiros = await window.dbManager?.getAll('roteiros') || [];
            
            const stats = [
                {
                    label: 'Total de Roteiros',
                    value: roteiros.length,
                    icon: '📍'
                },
                {
                    label: 'Roteiros Públicos',
                    value: roteiros.filter(r => r.public).length,
                    icon: '🌍'
                },
                {
                    label: 'Avaliação Média',
                    value: roteiros.length > 0 ? 
                        (roteiros.reduce((sum, r) => sum + (r.rating || 0), 0) / roteiros.length).toFixed(1) : '0',
                    icon: '⭐'
                },
                {
                    label: 'Aguardando Moderação',
                    value: roteiros.filter(r => !r.moderated).length,
                    icon: '⏳'
                }
            ];

            const statsHtml = stats.map(stat => `
                <div class="flex items-center justify-between py-2">
                    <div class="flex items-center">
                        <span class="text-lg mr-2">${stat.icon}</span>
                        <span class="text-sm text-gray-600">${stat.label}</span>
                    </div>
                    <span class="font-semibold text-gray-900">${stat.value}</span>
                </div>
            `).join('');

            container.innerHTML = statsHtml;

        } catch (error) {
            container.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    Erro ao carregar estatísticas
                </div>
            `;
        }
    }

    async loadModerationQueue() {
        const container = document.getElementById('moderationQueue');
        
        try {
            // Mock moderation items - replace with actual backend
            const moderationItems = [
                {
                    id: '1',
                    type: 'roteiro',
                    title: 'Rota das Cachoeiras',
                    reason: 'Reportado por conteúdo inadequado',
                    time: '2 horas atrás'
                },
                {
                    id: '2',
                    type: 'comment',
                    title: 'Comentário em "Trilha da Serra"',
                    reason: 'Linguagem imprópria',
                    time: '5 horas atrás'
                }
            ];

            const moderationHtml = moderationItems.map(item => `
                <div class="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded-r">
                    <div class="flex items-center justify-between mb-1">
                        <p class="text-sm font-medium text-gray-900">${item.title}</p>
                        <span class="text-xs text-gray-500">${item.time}</span>
                    </div>
                    <p class="text-xs text-gray-600 mb-2">${item.reason}</p>
                    <div class="flex space-x-2">
                        <button onclick="adminPanel.approveModeration('${item.id}')" 
                                class="text-green-600 hover:text-green-700 text-xs font-medium">
                            Aprovar
                        </button>
                        <button onclick="adminPanel.rejectModeration('${item.id}')" 
                                class="text-red-600 hover:text-red-700 text-xs font-medium">
                            Rejeitar
                        </button>
                    </div>
                </div>
            `).join('');

            container.innerHTML = moderationHtml || `
                <div class="text-center py-4 text-gray-500">
                    <span class="text-lg">✅</span>
                    <p class="text-sm mt-1">Nada para moderar</p>
                </div>
            `;

        } catch (error) {
            container.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    Erro ao carregar fila de moderação
                </div>
            `;
        }
    }

    async loadBilling() {
        // Implementation for billing view
        console.log('Loading billing data...');
    }

    async loadAnalytics() {
        // Implementation for analytics view
        console.log('Loading analytics data...');
    }

    async loadSettings() {
        // Implementation for settings view
        console.log('Loading settings...');
    }

    async loadSupport() {
        // Implementation for support view
        console.log('Loading support tickets...');
    }

    // User Management Methods
    async viewUser(userId) {
        const user = await window.dbManager?.getUser(userId);
        if (user) {
            this.showUserModal(user);
        }
    }

    async editUser(userId) {
        const user = await window.dbManager?.getUser(userId);
        if (user) {
            this.showEditUserModal(user);
        }
    }

    async toggleUserStatus(userId) {
        if (confirm('Tem certeza que deseja alterar o status deste usuário?')) {
            try {
                const user = await window.dbManager?.getUser(userId);
                if (user) {
                    await window.dbManager?.updateUser(userId, {
                        verified: !user.verified
                    });
                    this.showNotification('Status do usuário atualizado', 'success');
                    this.loadUsers();
                }
            } catch (error) {
                this.showNotification('Erro ao atualizar usuário', 'error');
            }
        }
    }

    // Content Management Methods
    async viewRoteiro(roteiroId) {
        console.log('Viewing roteiro:', roteiroId);
        // Implementation for viewing roteiro details
    }

    async moderateRoteiro(roteiroId) {
        console.log('Moderating roteiro:', roteiroId);
        // Implementation for roteiro moderation
    }

    // Moderation Methods
    async approveModeration(itemId) {
        console.log('Approving moderation item:', itemId);
        this.showNotification('Item aprovado', 'success');
        this.loadModerationQueue();
    }

    async rejectModeration(itemId) {
        console.log('Rejecting moderation item:', itemId);
        this.showNotification('Item rejeitado', 'success');
        this.loadModerationQueue();
    }

    // Filter Methods
    filterUsers() {
        this.currentPage = 1;
        this.loadUsers();
    }

    // Export Methods
    async exportUsers() {
        try {
            const users = await window.dbManager?.getAll('users') || [];
            const csv = this.generateUsersCSV(users);
            this.downloadCSV(csv, 'usuarios.csv');
            this.showNotification('Dados exportados com sucesso', 'success');
        } catch (error) {
            this.showNotification('Erro ao exportar dados', 'error');
        }
    }

    generateUsersCSV(users) {
        const headers = ['Nome', 'Email', 'Telefone', 'Plano', 'Status', 'Data de Cadastro'];
        const rows = users.map(user => [
            user.name || '',
            user.email || '',
            user.phone || '',
            user.plan || 'FREE',
            user.verified ? 'Ativo' : 'Inativo',
            user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : ''
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Utility Methods
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
    }

    getPlanBadgeClass(plan) {
        const classes = {
            'FREE': 'bg-gray-100 text-gray-800',
            'PREMIUM': 'bg-blue-100 text-blue-800',
            'PRO': 'bg-green-100 text-green-800',
            'ENTERPRISE': 'bg-yellow-100 text-yellow-800'
        };
        return classes[plan] || classes.FREE;
    }

    getActivityIcon(iconName) {
        const icons = {
            'user-plus': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>',
            'map': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 6l6-3 5.447 2.724A1 1 0 0121 6.618v10.764a1 1 0 01-.553.894L15 18l-6 3z"></path>',
            'credit-card': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>',
            'help-circle': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        };
        return icons[iconName] || icons['help-circle'];
    }

    getDefaultMetrics() {
        return {
            totalUsers: 0,
            totalRoteiros: 0,
            monthlyRevenue: 0,
            conversionRate: 0,
            userGrowth: 0,
            planCounts: { FREE: 0, PREMIUM: 0, PRO: 0, ENTERPRISE: 0 },
            roteiroGrowth: 0,
            revenueGrowth: 0,
            conversionGrowth: 0
        };
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    refreshCurrentView() {
        this.loadViewData(this.currentView);
    }

    showUserModal(user) {
        // Implementation for user details modal
        console.log('Showing user modal for:', user);
    }

    showEditUserModal(user) {
        // Implementation for edit user modal
        console.log('Showing edit user modal for:', user);
    }
}

// Initialize Admin Panel
let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});

// Make adminPanel available globally for onclick handlers
window.adminPanel = adminPanel;

console.log('✅ Admin Panel carregado');