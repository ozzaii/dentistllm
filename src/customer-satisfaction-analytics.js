// Customer Satisfaction Analytics with browser-compatible data loading
// This version uses hardcoded sample data instead of fetch for GitHub Pages compatibility

class CustomerSatisfactionAnalytics {
  constructor(data = null) {
    this.data = data;
    this.metrics = {
      overall: {},
      categories: {},
      trends: {},
      services: {},
      comments: {}
    };
  }

  // Load data - using hardcoded sample data for browser compatibility
  async loadData() {
    if (!this.data) {
      try {
        // Instead of fetching from files, use hardcoded sample data
        this.data = {
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
            "comments": [
              {
                "rating": 5,
                "comment": "Dr. Johnson was excellent! She explained everything clearly and made me feel at ease.",
                "date": "2025-03-15"
              },
              {
                "rating": 4,
                "comment": "Great service but had to wait 20 minutes past my appointment time.",
                "date": "2025-03-10"
              },
              {
                "rating": 3,
                "comment": "Treatment was good but prices seem to have increased significantly.",
                "date": "2025-03-05"
              },
              {
                "rating": 5,
                "comment": "The new digital scanning technology is amazing! No more uncomfortable molds.",
                "date": "2025-03-22"
              },
              {
                "rating": 2,
                "comment": "Waited over 45 minutes and the receptionist wasn't very apologetic about it.",
                "date": "2025-03-18"
              }
            ],
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
        
        console.log("Customer satisfaction data loaded successfully");
        return true;
      } catch (error) {
        console.error("Error loading customer satisfaction data:", error);
        return false;
      }
    }
    return true;
  }

  // Initialize analytics by processing data
  async initialize() {
    if (!this.data) {
      const success = await this.loadData();
      if (!success) return false;
    }
    
    this.processData();
    console.log("Customer satisfaction analytics initialized");
    return true;
  }

  // Process data to calculate various metrics
  processData() {
    if (!this.data || !this.data.customer_satisfaction) {
      console.error("No customer satisfaction data available");
      return false;
    }
    
    const csData = this.data.customer_satisfaction;
    
    // Process overall metrics
    this.metrics.overall = {
      rating: csData.overall_rating,
      timePeriod: csData.time_period,
      totalResponses: csData.total_responses
    };
    
    // Process category metrics
    this.metrics.categories = csData.categories;
    
    // Process trend data
    this.metrics.trends = {
      raw: csData.trend,
      changes: this.calculateTrendChanges(csData.trend)
    };
    
    // Process service breakdown
    this.metrics.services = csData.service_breakdown;
    
    // Process comments
    this.metrics.comments = {
      all: csData.comments,
      positive: csData.comments.filter(comment => comment.rating >= 4),
      negative: csData.comments.filter(comment => comment.rating <= 2),
      neutral: csData.comments.filter(comment => comment.rating === 3)
    };
    
    return true;
  }

  // Calculate changes between time periods in trend data
  calculateTrendChanges(trendData) {
    const periods = Object.keys(trendData);
    const changes = {};
    
    for (let i = 1; i < periods.length; i++) {
      const currentPeriod = periods[i];
      const previousPeriod = periods[i-1];
      const currentValue = trendData[currentPeriod];
      const previousValue = trendData[previousPeriod];
      
      changes[currentPeriod] = {
        absolute: currentValue - previousValue,
        percentage: ((currentValue - previousValue) / previousValue) * 100
      };
    }
    
    return changes;
  }

  // Get overall satisfaction summary
  getOverallSummary() {
    if (!this.metrics.overall) {
      return "No data available";
    }
    
    const highestCategory = this.getHighestRatedCategory();
    const lowestCategory = this.getLowestRatedCategory();
    const recentTrend = this.getRecentTrend();
    
    return {
      ...this.metrics.overall,
      highestCategory,
      lowestCategory,
      recentTrend
    };
  }

  // Get highest rated category
  getHighestRatedCategory() {
    if (!this.metrics.categories) {
      return null;
    }
    
    let highestCategory = null;
    let highestRating = 0;
    
    for (const [category, rating] of Object.entries(this.metrics.categories)) {
      if (rating > highestRating) {
        highestRating = rating;
        highestCategory = category;
      }
    }
    
    return {
      category: highestCategory.replace(/_/g, " "),
      rating: highestRating
    };
  }

  // Get lowest rated category
  getLowestRatedCategory() {
    if (!this.metrics.categories) {
      return null;
    }
    
    let lowestCategory = null;
    let lowestRating = 5;
    
    for (const [category, rating] of Object.entries(this.metrics.categories)) {
      if (rating < lowestRating) {
        lowestRating = rating;
        lowestCategory = category;
      }
    }
    
    return {
      category: lowestCategory.replace(/_/g, " "),
      rating: lowestRating
    };
  }

  // Get recent trend (last two periods)
  getRecentTrend() {
    if (!this.metrics.trends || !this.metrics.trends.raw) {
      return null;
    }
    
    const periods = Object.keys(this.metrics.trends.raw);
    if (periods.length < 2) {
      return null;
    }
    
    const currentPeriod = periods[periods.length - 1];
    const previousPeriod = periods[periods.length - 2];
    const currentValue = this.metrics.trends.raw[currentPeriod];
    const previousValue = this.metrics.trends.raw[previousPeriod];
    const change = currentValue - previousValue;
    const percentageChange = (change / previousValue) * 100;
    
    return {
      currentPeriod,
      previousPeriod,
      currentValue,
      previousValue,
      change,
      percentageChange,
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable"
    };
  }

  // Get service breakdown with rankings
  getServiceBreakdown() {
    if (!this.metrics.services) {
      return null;
    }
    
    // Convert to array for sorting
    const servicesArray = Object.entries(this.metrics.services).map(([service, data]) => ({
      service: service.replace(/_/g, " "),
      count: data.count,
      averageRating: data.average_rating
    }));
    
    // Sort by average rating
    const sortedByRating = [...servicesArray].sort((a, b) => b.averageRating - a.averageRating);
    
    // Sort by count
    const sortedByCount = [...servicesArray].sort((a, b) => b.count - a.count);
    
    return {
      byRating: sortedByRating,
      byCount: sortedByCount,
      mostPopular: sortedByCount[0],
      highestRated: sortedByRating[0],
      lowestRated: sortedByRating[sortedByRating.length - 1]
    };
  }

  // Get comment analysis
  getCommentAnalysis() {
    if (!this.metrics.comments || !this.metrics.comments.all) {
      return null;
    }
    
    const totalComments = this.metrics.comments.all.length;
    const positiveCount = this.metrics.comments.positive.length;
    const negativeCount = this.metrics.comments.negative.length;
    const neutralCount = this.metrics.comments.neutral.length;
    
    // Calculate sentiment ratio
    const sentimentRatio = {
      positive: (positiveCount / totalComments) * 100,
      negative: (negativeCount / totalComments) * 100,
      neutral: (neutralCount / totalComments) * 100
    };
    
    // Extract key themes from comments (simplified version)
    const keyThemes = this.extractKeyThemes();
    
    return {
      totalComments,
      distribution: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      },
      sentimentRatio,
      keyThemes,
      recentPositive: this.metrics.comments.positive.slice(0, 3),
      recentNegative: this.metrics.comments.negative.slice(0, 3)
    };
  }

  // Extract key themes from comments (simplified version)
  extractKeyThemes() {
    if (!this.metrics.comments || !this.metrics.comments.all) {
      return [];
    }
    
    // This is a simplified version - in a real implementation, 
    // this would use NLP techniques to extract themes
    const positiveThemes = [
      { theme: "Staff Friendliness", count: 3, examples: ["excellent", "friendly", "made me feel at ease"] },
      { theme: "Clear Explanations", count: 2, examples: ["explained everything clearly", "great explanations"] },
      { theme: "New Technology", count: 1, examples: ["digital scanning technology is amazing"] }
    ];
    
    const negativeThemes = [
      { theme: "Wait Times", count: 2, examples: ["waited 20 minutes", "waited over 45 minutes"] },
      { theme: "Pricing", count: 1, examples: ["prices seem to have increased significantly"] }
    ];
    
    return {
      positive: positiveThemes,
      negative: negativeThemes
    };
  }

  // Generate satisfaction insights
  generateInsights() {
    if (!this.metrics.overall) {
      return "No data available for insights";
    }
    
    const insights = [];
    
    // Overall trend insight
    const recentTrend = this.getRecentTrend();
    insights.push({
      type: "trend",
      title: "Satisfaction Trend",
      description: `Overall satisfaction ${recentTrend.direction === "up" ? "increased" : "decreased"} by ${Math.abs(recentTrend.percentageChange).toFixed(1)}% from ${recentTrend.previousPeriod} to ${recentTrend.currentPeriod}`,
      details: `Current rating is ${recentTrend.currentValue.toFixed(1)}/5.0 based on ${this.metrics.overall.totalResponses} responses.`
    });
    
    // Category strengths and weaknesses
    const highestCategory = this.getHighestRatedCategory();
    const lowestCategory = this.getLowestRatedCategory();
    
    insights.push({
      type: "strength",
      title: "Key Strength",
      description: `${highestCategory.category} is the highest rated aspect at ${highestCategory.rating.toFixed(1)}/5.0`,
      details: "This is a significant competitive advantage that should be maintained."
    });
    
    insights.push({
      type: "weakness",
      title: "Improvement Opportunity",
      description: `${lowestCategory.category} is the lowest rated aspect at ${lowestCategory.rating.toFixed(1)}/5.0`,
      details: "This represents the biggest opportunity for improving overall satisfaction."
    });
    
    // Service insights
    const serviceBreakdown = this.getServiceBreakdown();
    insights.push({
      type: "service",
      title: "Service Performance",
      description: `${serviceBreakdown.highestRated.service} has the highest satisfaction rating (${serviceBreakdown.highestRated.averageRating.toFixed(1)}/5.0)`,
      details: `${serviceBreakdown.mostPopular.service} is the most common procedure with ${serviceBreakdown.mostPopular.count} instances.`
    });
    
    // Comment sentiment insight
    const commentAnalysis = this.getCommentAnalysis();
    insights.push({
      type: "sentiment",
      title: "Customer Sentiment",
      description: `${commentAnalysis.sentimentRatio.positive.toFixed(1)}% of comments are positive, ${commentAnalysis.sentimentRatio.negative.toFixed(1)}% are negative`,
      details: `Key positive themes: ${commentAnalysis.keyThemes.positive.map(t => t.theme).join(", ")}`
    });
    
    return insights;
  }

  // Generate recommendations for improving satisfaction
  generateRecommendations() {
    if (!this.metrics.overall) {
      return "No data available for recommendations";
    }
    
    const recommendations = [];
    
    // Wait time recommendation
    const lowestCategory = this.getLowestRatedCategory();
    if (lowestCategory.category.includes("wait")) {
      recommendations.push({
        type: "operational",
        title: "Reduce Wait Times",
        description: "Implement buffer time between appointments to reduce patient waiting times.",
        details: "Consider 10-15 minute buffers between appointments and improved notification systems."
      });
    }
    
    // Value perception recommendation
    const categories = this.metrics.categories;
    if (categories.value_for_money < 4.0) {
      recommendations.push({
        type: "pricing",
        title: "Improve Value Perception",
        description: "Enhance communication about the value of treatments and services.",
        details: "Create materials explaining the technology, expertise, and long-term benefits behind pricing."
      });
    }
    
    // Service-specific recommendation
    const serviceBreakdown = this.getServiceBreakdown();
    recommendations.push({
      type: "service",
      title: `Promote ${serviceBreakdown.highestRated.service}`,
      description: `Leverage high satisfaction with ${serviceBreakdown.highestRated.service} (${serviceBreakdown.highestRated.averageRating.toFixed(1)}/5.0) in marketing.`,
      details: "Highlight patient testimonials and success stories for this service."
    });
    
    // Improvement for lowest-rated service
    recommendations.push({
      type: "training",
      title: `Improve ${serviceBreakdown.lowestRated.service} Experience`,
      description: `Focus on enhancing patient experience for ${serviceBreakdown.lowestRated.service} procedures.`,
      details: "Consider additional training, improved pain management, or better pre/post procedure communication."
    });
    
    // Comment-based recommendation
    const commentAnalysis = this.getCommentAnalysis();
    if (commentAnalysis.keyThemes.negative.length > 0) {
      const topNegativeTheme = commentAnalysis.keyThemes.negative[0];
      recommendations.push({
        type: "feedback",
        title: `Address ${topNegativeTheme.theme} Concerns`,
        description: `Implement changes to address ${topNegativeTheme.theme.toLowerCase()} issues mentioned in ${topNegativeTheme.count} comments.`,
        details: `Examples: "${topNegativeTheme.examples.join('", "')}"` 
      });
    }
    
    return recommendations;
  }
}

// Export the class for use in the main application
export default CustomerSatisfactionAnalytics;
