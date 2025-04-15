// Data Visualization Components for Dental AI Interface

class DataVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.charts = {};
    this.data = {
      customerSatisfaction: null,
      agentPerformance: null
    };
  }

  // Initialize the visualizer
  async initialize() {
    // Load Chart.js from CDN
    await this.loadChartJS();
    console.log("Data Visualizer initialized");
    return true;
  }

  // Load Chart.js library
  async loadChartJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      document.head.appendChild(script);
    });
  }

  // Load data from JSON files
  async loadData() {
    try {
      // Load customer satisfaction data
      const csResponse = await fetch('data/sample/customer_satisfaction.json');
      this.data.customerSatisfaction = await csResponse.json();
      
      // Load agent performance data
      const apResponse = await fetch('data/sample/agent_performance.json');
      this.data.agentPerformance = await apResponse.json();
      
      console.log("Data loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading data:", error);
      return false;
    }
  }

  // Create all visualizations
  createVisualizations() {
    if (!this.data.customerSatisfaction || !this.data.agentPerformance) {
      console.error("Data not loaded");
      return false;
    }
    
    // Create customer satisfaction trend chart
    this.createSatisfactionTrendChart();
    
    // Create agent performance comparison chart
    this.createAgentPerformanceChart();
    
    // Create service quality ratings chart
    this.createServiceQualityChart();
    
    // Create time of day performance chart
    this.createTimeOfDayChart();
    
    return true;
  }

  // Create customer satisfaction trend chart
  createSatisfactionTrendChart() {
    const ctx = this.createChartCanvas('satisfaction-trend-chart');
    
    const trendData = this.data.customerSatisfaction.customer_satisfaction.trend;
    const labels = Object.keys(trendData);
    const data = Object.values(trendData);
    
    this.charts.satisfactionTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Overall Satisfaction',
          data: data,
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#4361ee',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Customer Satisfaction Trend',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 3.5,
            max: 5,
            ticks: {
              stepSize: 0.5
            },
            title: {
              display: true,
              text: 'Rating (out of 5)',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        }
      }
    });
    
    return this.charts.satisfactionTrend;
  }

  // Create agent performance comparison chart
  createAgentPerformanceChart() {
    const ctx = this.createChartCanvas('agent-performance-chart');
    
    const agents = this.data.agentPerformance.agent_performance.agents;
    const labels = agents.map(agent => agent.name.split(' ')[1]); // Last names only
    const satisfactionData = agents.map(agent => agent.metrics.satisfaction_rating);
    const successRateData = agents.map(agent => agent.metrics.treatment_success_rate / 20); // Scale down for visualization
    
    this.charts.agentPerformance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Satisfaction Rating',
            data: satisfactionData,
            backgroundColor: '#4361ee',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          },
          {
            label: 'Success Rate (scaled)',
            data: successRateData,
            backgroundColor: '#2ec4b6',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Agent Performance Comparison',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.datasetIndex === 0) {
                    label += context.parsed.y.toFixed(1) + '/5.0';
                  } else {
                    label += (context.parsed.y * 20).toFixed(1) + '%';
                  }
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 3.5,
            max: 5,
            ticks: {
              stepSize: 0.5
            },
            title: {
              display: true,
              text: 'Rating',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Dentist',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        }
      }
    });
    
    return this.charts.agentPerformance;
  }

  // Create service quality ratings chart
  createServiceQualityChart() {
    const ctx = this.createChartCanvas('service-quality-chart');
    
    const serviceBreakdown = this.data.customerSatisfaction.customer_satisfaction.service_breakdown;
    const labels = Object.keys(serviceBreakdown).map(key => 
      key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
    const ratings = Object.values(serviceBreakdown).map(service => service.average_rating);
    const counts = Object.values(serviceBreakdown).map(service => service.count);
    
    // Normalize counts for bubble size (between 10 and 30)
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const normalizedCounts = counts.map(count => 
      10 + ((count - minCount) / (maxCount - minCount)) * 20
    );
    
    this.charts.serviceQuality = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Service Quality',
          data: ratings,
          backgroundColor: 'rgba(67, 97, 238, 0.2)',
          borderColor: '#4361ee',
          pointBackgroundColor: '#4361ee',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#4361ee',
          pointRadius: normalizedCounts,
          pointHoverRadius: (ctx) => normalizedCounts[ctx.dataIndex] + 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Service Quality Ratings',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return `Rating: ${context.raw.toFixed(1)}/5.0 (${counts[context.dataIndex]} responses)`;
              }
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            suggestedMin: 3.5,
            suggestedMax: 5,
            ticks: {
              stepSize: 0.5,
              backdropColor: 'rgba(255, 255, 255, 0.8)'
            }
          }
        }
      }
    });
    
    return this.charts.serviceQuality;
  }

  // Create time of day performance chart
  createTimeOfDayChart() {
    const ctx = this.createChartCanvas('time-of-day-chart');
    
    const timeData = this.data.agentPerformance.agent_performance.performance_by_time;
    const labels = Object.keys(timeData).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    );
    const satisfactionData = Object.values(timeData).map(time => time.average_satisfaction);
    const durationData = Object.values(timeData).map(time => time.average_duration);
    
    this.charts.timeOfDay = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Satisfaction Rating',
            data: satisfactionData,
            backgroundColor: '#4361ee',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
            yAxisID: 'y'
          },
          {
            label: 'Avg. Duration (min)',
            data: durationData,
            backgroundColor: '#ff9f1c',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Performance by Time of Day',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: false,
            min: 4.0,
            max: 5.0,
            ticks: {
              stepSize: 0.2
            },
            title: {
              display: true,
              text: 'Satisfaction Rating',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: false,
            min: 30,
            max: 50,
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Duration (minutes)',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time of Day',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        }
      }
    });
    
    return this.charts.timeOfDay;
  }

  // Helper method to create a canvas element for a chart
  createChartCanvas(id) {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.height = '300px';
    chartContainer.style.marginBottom = '2rem';
    
    const canvas = document.createElement('canvas');
    canvas.id = id;
    
    chartContainer.appendChild(canvas);
    this.container.appendChild(chartContainer);
    
    return canvas.getContext('2d');
  }

  // Generate placeholder chart images for initial display
  generatePlaceholderImages() {
    // This would normally generate actual chart images
    // For now, we'll just return placeholder URLs
    return {
      satisfactionTrend: 'assets/placeholder-chart1.png',
      agentPerformance: 'assets/placeholder-chart2.png',
      serviceQuality: 'assets/placeholder-chart3.png',
      timeOfDay: 'assets/placeholder-chart4.png'
    };
  }

  // Update visualizations based on filter
  updateVisualizations(filter) {
    // This would filter the visualizations based on the selected category
    console.log('Filtering visualizations by:', filter);
    // In a real implementation, this would show/hide charts based on the filter
  }
}

// Export the class for use in the main application
export default DataVisualizer;
