document.addEventListener('DOMContentLoaded', function() {
    fetchAnalyticsData();
});

async function fetchAnalyticsData() {
    try {
        const response = await fetch('/admin/dashboard-analytics');
        const data = await response.json();
        
        renderVisitorChart(data.visitors);
        renderConversionChart(data.conversion);
        renderGeoChart(data.geography);
        renderIncomeChart(data.income);
        renderQuickStats(data.quickStats);
        renderPolicyPerformance(data.policyDistribution);
        renderCustomerDemographics(data.ageGroups);
        renderPremiumTrends(data.premiumTrends);
        
        // Update summary stats
        document.getElementById('totalVisitors').textContent = data.visitors.monthly.toLocaleString();
        document.getElementById('conversionRate').textContent = data.conversion.rate;
        document.getElementById('totalCities').textContent = data.geography.length;
        document.getElementById('totalIncome').textContent = data.income.toLocaleString();
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
}

function renderVisitorChart(visitors) {
    const ctx = document.getElementById('visitorChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Daily', 'Weekly', 'Monthly'],
            datasets: [{
                label: 'Visitors',
                data: [visitors.daily, visitors.weekly, visitors.monthly],
                borderColor: '#003366',
                backgroundColor: 'rgba(0, 51, 102, 0.1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderConversionChart(conversion) {
    const ctx = document.getElementById('conversionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Converted', 'Not Converted'],
            datasets: [{
                data: [conversion.rate, 100 - conversion.rate],
                backgroundColor: ['#ff9900', '#e0e0e0']
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

function renderGeoChart(geography) {
    const ctx = document.getElementById('geoChart').getContext('2d');
    const labels = geography.map(item => item._id);
    const data = geography.map(item => item.count);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Visitors by Location',
                data: data,
                backgroundColor: '#003366',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function renderIncomeChart(income) {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const lastSixMonths = months.slice(currentMonth - 5, currentMonth + 1);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: lastSixMonths,
            datasets: [{
                label: 'Monthly Income',
                data: Array(6).fill(income/6),
                borderColor: '#ff9900',
                backgroundColor: 'rgba(255, 153, 0, 0.1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹ ' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹ ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
} // Added missing closing brace

function renderCustomerDemographics(data) {
    const ctx = document.getElementById('demographicsChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['18-30', '31-45', '46-60', '60+'],
            datasets: [{
                data: data, // Fixed: removed .ageGroups
                backgroundColor: [
                    '#003366',
                    '#004d99',
                    '#0066cc',
                    '#0080ff'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}
function renderQuickStats(data) {
    const ctx = document.getElementById('quickStatsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Today', 'This Week', 'This Month'],
            datasets: [{
                label: 'New Policies',
                data: [data.todayPolicies, data.weekPolicies, data.monthPolicies],
                backgroundColor: '#003366'
            }, {
                label: 'Revenue (₹)',
                data: [data.todayRevenue, data.weekRevenue, data.monthRevenue],
                backgroundColor: '#ff9900'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

function renderPolicyPerformance(data) {
    const ctx = document.getElementById('policyPerformanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Term Life', 'Endowment', 'ULIP', 'Pension', 'Health'],
            datasets: [{
                label: 'Policy Distribution',
                data: data,
                backgroundColor: 'rgba(0, 51, 102, 0.2)',
                borderColor: '#003366',
                pointBackgroundColor: '#003366'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Add the missing Premium Trends function
function renderPremiumTrends(data) {
    const ctx = document.getElementById('premiumTrendsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.months,
            datasets: [{
                label: 'Premium Collection',
                data: data.premiumAmount,
                borderColor: '#ff9900',
                backgroundColor: 'rgba(255, 153, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹ ' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹ ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}