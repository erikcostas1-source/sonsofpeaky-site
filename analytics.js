/**
 * Sistema de Analytics Avançado
 * Gerador de Rolês - Métricas, dashboards e insights
 */

class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.currentPeriod = '7d';
        this.refreshInterval = null;
        this.realTimeEnabled = true;
        
        this.init();
    }

    async init() {
        await this.loadAnalyticsData();
        this.setupEventListeners();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.generateActivityHeatmap();
    }

    setupEventListeners() {
        // Period filters
        document.querySelectorAll('[data-period]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.changePeriod(e.target.dataset.period);
            });
        });

        // Chart filters
        document.querySelectorAll('[data-chart]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.updateChart(e.target.dataset.chart, e.target.dataset.metric);
            });
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.goBack();
        });

        // Date range picker
        document.getElementById('startDate').addEventListener('change', () => {
            this.updateDateRange();
        });
        
        document.getElementById('endDate').addEventListener('change', () => {
            this.updateDateRange();
        });
    }

    async loadAnalyticsData() {
        try {
            // Load real analytics data from database
            this.analyticsData = await this.fetchAnalyticsData();
            this.updateMetrics();
        } catch (error) {
            console.error('Erro ao carregar dados de analytics:', error);
            // Use mock data as fallback
            this.analyticsData = this.generateMockData();
            this.updateMetrics();
        }
    }

    async fetchAnalyticsData() {
        // Fetch real data from API or database
        const [
            userMetrics,
            generationMetrics,
            performanceMetrics,
            revenueMetrics
        ] = await Promise.all([
            this.fetchUserMetrics(),
            this.fetchGenerationMetrics(),
            this.fetchPerformanceMetrics(),
            this.fetchRevenueMetrics()
        ]);

        return {
            users: userMetrics,
            generations: generationMetrics,
            performance: performanceMetrics,
            revenue: revenueMetrics
        };
    }

    async fetchUserMetrics() {
        // Implementation would fetch from actual database
        try {
            const response = await fetch('/api/analytics/users', {
                headers: {
                    'Authorization': `Bearer ${await auth.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            return this.generateMockUserData();
        }
    }

    async fetchGenerationMetrics() {
        try {
            const response = await fetch('/api/analytics/generations', {
                headers: {
                    'Authorization': `Bearer ${await auth.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            return this.generateMockGenerationData();
        }
    }

    async fetchPerformanceMetrics() {
        try {
            const response = await fetch('/api/analytics/performance', {
                headers: {
                    'Authorization': `Bearer ${await auth.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            return this.generateMockPerformanceData();
        }
    }

    async fetchRevenueMetrics() {
        try {
            const response = await fetch('/api/analytics/revenue', {
                headers: {
                    'Authorization': `Bearer ${await auth.getToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            return this.generateMockRevenueData();
        }
    }

    generateMockData() {
        const now = new Date();
        const days = 30;
        
        return {
            users: this.generateMockUserData(),
            generations: this.generateMockGenerationData(),
            performance: this.generateMockPerformanceData(),
            revenue: this.generateMockRevenueData()
        };
    }

    generateMockUserData() {
        const days = 30;
        const data = [];
        let totalUsers = 1000;
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dailyGrowth = Math.floor(Math.random() * 20) - 5; // -5 to +15
            totalUsers += dailyGrowth;
            
            data.push({
                date: date.toISOString().split('T')[0],
                totalUsers: totalUsers,
                activeUsers: Math.floor(totalUsers * 0.3),
                newUsers: Math.max(0, dailyGrowth)
            });
        }
        
        return data;
    }

    generateMockGenerationData() {
        const days = 30;
        const data = [];
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // More generations on weekends
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const baseGenerations = isWeekend ? 180 : 120;
            const variance = Math.floor(Math.random() * 60) - 30;
            
            data.push({
                date: date.toISOString().split('T')[0],
                generations: Math.max(50, baseGenerations + variance),
                successRate: 0.95 + Math.random() * 0.05,
                avgTime: 2 + Math.random() * 2
            });
        }
        
        return data;
    }

    generateMockPerformanceData() {
        return {
            avgGenerationTime: 2.3,
            successRate: 0.987,
            userSatisfaction: 4.6,
            errorRate: 0.013,
            serverUptime: 0.999
        };
    }

    generateMockRevenueData() {
        const months = 12;
        const data = [];
        let totalRevenue = 0;
        
        for (let i = months; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const monthlyRevenue = 5000 + Math.floor(Math.random() * 3000);
            totalRevenue += monthlyRevenue;
            
            data.push({
                month: date.toISOString().slice(0, 7),
                revenue: monthlyRevenue,
                subscriptions: Math.floor(monthlyRevenue / 29),
                churn: 0.05 + Math.random() * 0.05
            });
        }
        
        return data;
    }

    updateMetrics() {
        const { users, generations, revenue } = this.analyticsData;
        
        // Update key metrics
        const latestUserData = users[users.length - 1];
        const latestGenerationData = generations[generations.length - 1];
        const latestRevenueData = revenue[revenue.length - 1];
        
        document.getElementById('totalUsers').textContent = this.formatNumber(latestUserData.totalUsers);
        document.getElementById('activeUsers').textContent = this.formatNumber(latestUserData.activeUsers);
        document.getElementById('totalGenerations').textContent = this.formatNumber(
            generations.reduce((sum, day) => sum + day.generations, 0)
        );
        document.getElementById('totalRevenue').textContent = `R$ ${this.formatCurrency(latestRevenueData.revenue)}`;
        
        // Calculate and update trends
        this.updateTrends();
    }

    updateTrends() {
        const { users, generations, revenue } = this.analyticsData;
        
        // Calculate growth rates
        const userGrowth = this.calculateGrowthRate(users, 'totalUsers');
        const generationGrowth = this.calculateGrowthRate(generations, 'generations');
        const revenueGrowth = this.calculateGrowthRate(revenue, 'revenue');
        
        // Update trend indicators
        this.updateTrendIndicator('totalUsers', userGrowth);
        this.updateTrendIndicator('totalGenerations', generationGrowth);
        this.updateTrendIndicator('totalRevenue', revenueGrowth);
    }

    calculateGrowthRate(data, field) {
        if (data.length < 7) return 0;
        
        const recent = data.slice(-7).reduce((sum, item) => sum + item[field], 0) / 7;
        const previous = data.slice(-14, -7).reduce((sum, item) => sum + item[field], 0) / 7;
        
        return previous === 0 ? 0 : ((recent - previous) / previous) * 100;
    }

    updateTrendIndicator(metricId, growthRate) {
        const metricCard = document.getElementById(metricId).closest('.metric-card');
        const trendElement = metricCard.querySelector('.metric-trend');
        
        if (trendElement) {
            const trendText = `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
            trendElement.textContent = trendText;
            
            // Update trend class
            trendElement.className = 'metric-trend';
            if (growthRate > 5) {
                trendElement.classList.add('trend-up');
            } else if (growthRate < -5) {
                trendElement.classList.add('trend-down');
            } else {
                trendElement.classList.add('trend-neutral');
            }
        }
    }

    initializeCharts() {
        this.initUserGrowthChart();
        this.initGenerationsChart();
        this.initPlanDistributionChart();
    }

    initUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart').getContext('2d');
        const { users } = this.analyticsData;
        
        this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: users.map(item => this.formatDate(item.date)),
                datasets: [{
                    label: 'Usuários Totais',
                    data: users.map(item => item.totalUsers),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#f1f5f9'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    initGenerationsChart() {
        const ctx = document.getElementById('generationsChart').getContext('2d');
        const { generations } = this.analyticsData;
        
        this.charts.generations = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: generations.map(item => this.formatDate(item.date)),
                datasets: [{
                    label: 'Gerações',
                    data: generations.map(item => item.generations),
                    backgroundColor: '#f59e0b',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        }
                    }
                }
            }
        });
    }

    initPlanDistributionChart() {
        const ctx = document.getElementById('planDistributionChart').getContext('2d');
        
        this.charts.planDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['FREE', 'PREMIUM', 'PRO', 'ENTERPRISE'],
                datasets: [{
                    data: [68, 22, 8, 2],
                    backgroundColor: ['#9ca3af', '#2563eb', '#10b981', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
    }

    generateActivityHeatmap() {
        const heatmapContainer = document.getElementById('activityHeatmap');
        heatmapContainer.innerHTML = '';
        
        // Generate 24 hours of activity data
        for (let hour = 0; hour < 24; hour++) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            // Simulate activity levels (higher during day hours)
            let activityLevel = 0;
            if (hour >= 8 && hour <= 22) {
                activityLevel = Math.floor(Math.random() * 5) + 1;
            } else if (hour >= 6 && hour <= 23) {
                activityLevel = Math.floor(Math.random() * 3);
            }
            
            if (activityLevel > 0) {
                cell.classList.add(`heatmap-${activityLevel}`);
            }
            
            // Add tooltip
            cell.title = `${hour}:00 - Atividade: ${activityLevel}/5`;
            
            heatmapContainer.appendChild(cell);
        }
    }

    changePeriod(period) {
        // Update active button
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        this.currentPeriod = period;
        
        if (period === 'custom') {
            this.showCustomDatePicker();
        } else {
            this.loadPeriodData(period);
        }
    }

    showCustomDatePicker() {
        // Show/focus date inputs
        document.getElementById('startDate').style.display = 'block';
        document.getElementById('endDate').style.display = 'block';
    }

    updateDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate) {
            this.loadCustomPeriodData(startDate, endDate);
        }
    }

    async loadPeriodData(period) {
        // Show loading state
        this.showLoadingState();
        
        try {
            // Reload data for the selected period
            await this.loadAnalyticsData();
            this.updateCharts();
        } catch (error) {
            console.error('Erro ao carregar dados do período:', error);
        } finally {
            this.hideLoadingState();
        }
    }

    async loadCustomPeriodData(startDate, endDate) {
        // Implementation for custom date range
        console.log('Loading custom period data:', startDate, 'to', endDate);
    }

    updateChart(chartName, metric) {
        // Update active button
        const chartButtons = document.querySelectorAll(`[data-chart="${chartName}"]`);
        chartButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-chart="${chartName}"][data-metric="${metric}"]`).classList.add('active');
        
        // Update chart data based on metric
        if (chartName === 'users') {
            this.updateUserChart(metric);
        } else if (chartName === 'generations') {
            this.updateGenerationChart(metric);
        }
    }

    updateUserChart(metric) {
        const chart = this.charts.userGrowth;
        const { users } = this.analyticsData;
        
        let data, label, color;
        
        switch (metric) {
            case 'total':
                data = users.map(item => item.totalUsers);
                label = 'Usuários Totais';
                color = '#2563eb';
                break;
            case 'active':
                data = users.map(item => item.activeUsers);
                label = 'Usuários Ativos';
                color = '#10b981';
                break;
            case 'new':
                data = users.map(item => item.newUsers);
                label = 'Novos Usuários';
                color = '#f59e0b';
                break;
        }
        
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].label = label;
        chart.data.datasets[0].borderColor = color;
        chart.data.datasets[0].backgroundColor = `${color}20`;
        chart.update('none');
    }

    updateGenerationChart(metric) {
        const chart = this.charts.generations;
        
        if (metric === 'hourly') {
            // Switch to hourly view
            this.loadHourlyGenerationData();
        } else {
            // Daily view (default)
            this.loadDailyGenerationData();
        }
    }

    loadHourlyGenerationData() {
        // Generate hourly data for today
        const hourlyData = [];
        const labels = [];
        
        for (let hour = 0; hour < 24; hour++) {
            labels.push(`${hour}:00`);
            // Simulate higher activity during business hours
            let generations = 0;
            if (hour >= 8 && hour <= 22) {
                generations = Math.floor(Math.random() * 50) + 10;
            } else {
                generations = Math.floor(Math.random() * 10);
            }
            hourlyData.push(generations);
        }
        
        const chart = this.charts.generations;
        chart.data.labels = labels;
        chart.data.datasets[0].data = hourlyData;
        chart.update('none');
    }

    loadDailyGenerationData() {
        const chart = this.charts.generations;
        const { generations } = this.analyticsData;
        
        chart.data.labels = generations.map(item => this.formatDate(item.date));
        chart.data.datasets[0].data = generations.map(item => item.generations);
        chart.update('none');
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.update('none');
        });
    }

    startRealTimeUpdates() {
        if (this.realTimeEnabled) {
            this.refreshInterval = setInterval(() => {
                this.refreshMetrics();
            }, 30000); // Update every 30 seconds
        }
    }

    async refreshMetrics() {
        try {
            const newData = await this.fetchAnalyticsData();
            this.analyticsData = newData;
            this.updateMetrics();
            this.updateCharts();
        } catch (error) {
            console.error('Erro ao atualizar métricas:', error);
        }
    }

    async exportData() {
        try {
            const exportData = {
                period: this.currentPeriod,
                exportDate: new Date().toISOString(),
                metrics: this.analyticsData,
                summary: {
                    totalUsers: this.analyticsData.users[this.analyticsData.users.length - 1].totalUsers,
                    totalGenerations: this.analyticsData.generations.reduce((sum, day) => sum + day.generations, 0),
                    avgPerformance: this.analyticsData.performance
                }
            };
            
            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${this.currentPeriod}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Dados exportados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.showNotification('Erro ao exportar dados', 'error');
        }
    }

    goBack() {
        if (document.referrer) {
            window.history.back();
        } else {
            window.location.href = 'admin.html';
        }
    }

    showLoadingState() {
        // Show loading indicators
        document.querySelectorAll('.analytics-card').forEach(card => {
            card.style.opacity = '0.6';
        });
    }

    hideLoadingState() {
        document.querySelectorAll('.analytics-card').forEach(card => {
            card.style.opacity = '1';
        });
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    formatCurrency(value) {
        return (value / 1000).toFixed(1) + 'K';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { 
            month: 'short', 
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationClasses(type)}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
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

    destroy() {
        // Clean up intervals and charts
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });
    }
}

// Initialize analytics manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.analyticsManager) {
        window.analyticsManager.destroy();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}