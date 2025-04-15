// Data Visualizer with browser-compatible data loading
// This version uses hardcoded sample data instead of fetch for GitHub Pages compatibility

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
    // Load Chart.js from CDN if not already loaded
    if (typeof Chart === 'undefined') {
      await this.loadChartJS();
    }
    console.log("Data Visualizer initialized");
    return true;
  }

  // Load Chart.js library
  async loadChartJS() {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      document.head.appendChild(script);
    });
  }

  // Load data - using hardcoded sample data for browser compatibility
  async loadData() {
    try {
      // Instead of fetching from files, use hardcoded sample data
      this.data.customerSatisfaction = {
        "customer_satisfaction": {
          "overall_rating": 4.2,
          "time_period": "March 2025",
          "total_responses": 156,
          "categories": {
            "staff_friendliness": 4.8,
            "cleanliness": 4.7,
            "treatment_quality": 4.5,
            "appointment_scheduling": 4.1,
            "wait_times": 3.6,
            "value_for_money": 3.9,
            "follow_up_care": 4.3
          },
          "trend": {
            "Oct_2024": 3.9,
            "Nov_2024": 4.0,
            "Dec_2024": 4.0,
            "Jan_2025": 4.1,
            "Feb_2025": 4.1,
            "Mar_2025": 4.2
          },
          "service_breakdown": {
            "routine_checkup": {
              "count": 78,
              "average_rating": 4.4
            },
            "cleaning": {
              "count": 65,
              "average_rating": 4.5
            },
            "fillings": {
              "count": 32,
              "average_rating": 4.1
            },
            "root_canal": {
              "count": 12,
              "average_rating": 3.8
            },
            "extraction": {
              "count": 8,
              "average_rating": 3.9
            },
            "cosmetic_procedures": {
              "count": 15,
              "average_rating": 4.6
            }
          }
        }
      };
      
      this.data.agentPerformance = {
        "agent_performance": {
          "time_period": "March 2025",
          "total_agents": 8,
          "overall_metrics": {
            "average_satisfaction_rating": 4.6,
            "average_appointment_duration": 43,
            "appointments_per_day": 12.5,
            "treatment_success_rate": 97.2
          },
          "agents": [
            {
              "id": "A001",
              "name": "Dr. Sarah Johnson",
              "role": "Senior Dentist",
              "metrics": {
                "satisfaction_rating": 4.9,
                "appointment_duration": 42,
                "appointments_per_day": 11,
                "treatment_success_rate": 99.1,
                "patient_retention": 94.5
              },
              "specialties": ["General Dentistry", "Cosmetic Procedures"]
            },
            {
              "id": "A002",
              "name": "Dr. Michael Chen",
              "role": "Dentist",
              "metrics": {
                "satisfaction_rating": 4.8,
                "appointment_duration": 40,
                "appointments_per_day": 12,
                "treatment_success_rate": 98.5,
                "patient_retention": 92.1
              },
              "specialties": ["Pediatric Dentistry", "Preventive Care"]
            },
            {
              "id": "A003",
              "name": "Dr. Elena Rodriguez",
              "role": "Dentist",
              "metrics": {
                "satisfaction_rating": 4.7,
                "appointment_duration": 38,
                "appointments_per_day": 14,
                "treatment_success_rate": 97.8,
                "patient_retention": 90.3
              },
              "specialties": ["Endodontics", "Restorative Dentistry"]
            },
            {
              "id": "A004",
              "name": "Dr. James Wilson",
              "role": "Associate Dentist",
              "metrics": {
                "satisfaction_rating": 4.5,
                "appointment_duration": 45,
                "appointments_per_day": 10,
                "treatment_success_rate": 96.9,
                "patient_retention": 88.7
              },
              "specialties": ["Oral Surgery", "Implants"]
            }
          ],
          "performance_by_time": {
            "morning": {
              "average_satisfaction": 4.7,
              "average_duration": 41
            },
            "afternoon": {
              "average_satisfaction": 4.5,
              "average_duration": 44
            },
            "evening": {
              "average_satisfaction": 4.6,
              "average_duration": 42
            }
          },
          "performance_by_procedure": {
            "routine_checkup": {
              "average_satisfaction": 4.7,
              "average_duration": 35
            },
            "cleaning": {
              "average_satisfaction": 4.6,
              "average_duration": 40
            },
            "fillings": {
              "average_satisfaction": 4.5,
              "average_duration": 45
            },
            "root_canal": {
              "average_satisfaction": 4.3,
              "average_duration": 60
            },
            "extraction": {
              "average_satisfaction": 4.4,
              "average_duration": 50
            },
            "cosmetic_procedures": {
              "average_satisfaction": 4.8,
              "average_duration": 65
            }
          }
        }
      };
      
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
    
    try {
      // Create customer satisfaction trend chart
      this.createSatisfactionTrendChart();
      
      // Create agent performance comparison chart
      this.createAgentPerformanceChart();
      
      // Create service quality ratings chart
      this.createServiceQualityChart();
      
      // Create time of day performance chart
      this.createTimeOfDayChart();
      
      return true;
    } catch (error) {
      console.error("Error creating visualizations:", error);
      return false;
    }
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

  // Update visualizations based on filter
  updateVisualizations(filter) {
    // This would filter the visualizations based on the selected category
    console.log('Filtering visualizations by:', filter);
    // In a real implementation, this would show/hide charts based on the filter
  }
}

// Export the class for use in the main application
export default DataVisualizer;
