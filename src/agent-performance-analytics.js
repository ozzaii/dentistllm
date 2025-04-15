// Agent Performance Analytics for Dental AI Interface

class AgentPerformanceAnalytics {
  constructor(data = null) {
    this.data = data;
    this.metrics = {
      overall: {},
      individual: {},
      comparative: {},
      trends: {}
    };
  }

  // Load data from JSON file
  async loadData() {
    if (!this.data) {
      try {
        const response = await fetch('data/sample/agent_performance.json');
        this.data = await response.json();
        console.log("Agent performance data loaded successfully");
        return true;
      } catch (error) {
        console.error("Error loading agent performance data:", error);
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
    console.log("Agent performance analytics initialized");
    return true;
  }

  // Process data to calculate various metrics
  processData() {
    if (!this.data || !this.data.agent_performance) {
      console.error("No agent performance data available");
      return false;
    }
    
    const agentData = this.data.agent_performance;
    
    // Process overall metrics
    this.metrics.overall = {
      averageSatisfaction: agentData.overall_metrics.average_satisfaction_rating,
      averageDuration: agentData.overall_metrics.average_appointment_duration,
      appointmentsPerDay: agentData.overall_metrics.appointments_per_day,
      successRate: agentData.overall_metrics.treatment_success_rate
    };
    
    // Process individual agent metrics
    this.metrics.individual = agentData.agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      satisfaction: agent.metrics.satisfaction_rating,
      duration: agent.metrics.appointment_duration,
      appointmentsPerDay: agent.metrics.appointments_per_day,
      successRate: agent.metrics.treatment_success_rate,
      patientRetention: agent.metrics.patient_retention,
      specialties: agent.specialties,
      comments: agent.comments
    }));
    
    // Process comparative metrics
    this.metrics.comparative = {
      topPerformers: this.calculateTopPerformers(),
      improvementAreas: this.calculateImprovementAreas(),
      efficiencyRanking: this.calculateEfficiencyRanking(),
      satisfactionRanking: this.calculateSatisfactionRanking()
    };
    
    // Process time-based metrics
    this.metrics.timeOfDay = agentData.performance_by_time;
    
    // Process procedure-based metrics
    this.metrics.procedurePerformance = agentData.performance_by_procedure;
    
    return true;
  }

  // Calculate top performers based on satisfaction and success rate
  calculateTopPerformers(limit = 3) {
    if (!this.metrics.individual || this.metrics.individual.length === 0) {
      return [];
    }
    
    // Sort by satisfaction rating
    const sortedBySatisfaction = [...this.metrics.individual]
      .sort((a, b) => b.satisfaction - a.satisfaction)
      .slice(0, limit);
    
    // Sort by success rate
    const sortedBySuccess = [...this.metrics.individual]
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
    
    return {
      bySatisfaction: sortedBySatisfaction,
      bySuccessRate: sortedBySuccess
    };
  }

  // Calculate areas needing improvement
  calculateImprovementAreas(threshold = 4.5) {
    if (!this.metrics.individual || this.metrics.individual.length === 0) {
      return [];
    }
    
    // Find agents with satisfaction below threshold
    const needsImprovement = this.metrics.individual
      .filter(agent => agent.satisfaction < threshold)
      .sort((a, b) => a.satisfaction - b.satisfaction);
    
    return needsImprovement;
  }

  // Calculate efficiency ranking based on appointment duration and satisfaction
  calculateEfficiencyRanking() {
    if (!this.metrics.individual || this.metrics.individual.length === 0) {
      return [];
    }
    
    // Calculate efficiency score (lower duration with higher satisfaction is better)
    const withEfficiencyScore = this.metrics.individual.map(agent => ({
      ...agent,
      efficiencyScore: (agent.satisfaction / agent.duration) * 100 // Higher score is better
    }));
    
    // Sort by efficiency score
    return [...withEfficiencyScore].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }

  // Calculate satisfaction ranking
  calculateSatisfactionRanking() {
    if (!this.metrics.individual || this.metrics.individual.length === 0) {
      return [];
    }
    
    // Sort by satisfaction rating
    return [...this.metrics.individual].sort((a, b) => b.satisfaction - a.satisfaction);
  }

  // Get overall performance summary
  getOverallSummary() {
    if (!this.metrics.overall) {
      return "No data available";
    }
    
    return {
      ...this.metrics.overall,
      topPerformer: this.metrics.comparative.satisfactionRanking[0],
      mostEfficient: this.metrics.comparative.efficiencyRanking[0],
      bestTimeOfDay: this.getBestTimeOfDay(),
      bestProcedure: this.getBestProcedure()
    };
  }

  // Get individual agent performance
  getAgentPerformance(agentId) {
    if (!this.metrics.individual || this.metrics.individual.length === 0) {
      return null;
    }
    
    const agent = this.metrics.individual.find(a => a.id === agentId);
    if (!agent) {
      return null;
    }
    
    // Get agent's rank in various categories
    const satisfactionRank = this.metrics.comparative.satisfactionRanking.findIndex(a => a.id === agentId) + 1;
    const efficiencyRank = this.metrics.comparative.efficiencyRanking.findIndex(a => a.id === agentId) + 1;
    
    return {
      ...agent,
      satisfactionRank,
      efficiencyRank,
      comparedToAverage: {
        satisfaction: agent.satisfaction - this.metrics.overall.averageSatisfaction,
        duration: agent.duration - this.metrics.overall.averageDuration,
        appointmentsPerDay: agent.appointmentsPerDay - this.metrics.overall.appointmentsPerDay,
        successRate: agent.successRate - this.metrics.overall.successRate
      }
    };
  }

  // Get best time of day based on satisfaction
  getBestTimeOfDay() {
    if (!this.metrics.timeOfDay) {
      return null;
    }
    
    let bestTime = null;
    let highestSatisfaction = 0;
    
    for (const [time, data] of Object.entries(this.metrics.timeOfDay)) {
      if (data.average_satisfaction > highestSatisfaction) {
        highestSatisfaction = data.average_satisfaction;
        bestTime = time;
      }
    }
    
    return {
      timeOfDay: bestTime,
      satisfaction: highestSatisfaction
    };
  }

  // Get best procedure based on satisfaction
  getBestProcedure() {
    if (!this.metrics.procedurePerformance) {
      return null;
    }
    
    let bestProcedure = null;
    let highestSatisfaction = 0;
    
    for (const [procedure, data] of Object.entries(this.metrics.procedurePerformance)) {
      if (data.average_satisfaction > highestSatisfaction) {
        highestSatisfaction = data.average_satisfaction;
        bestProcedure = procedure;
      }
    }
    
    return {
      procedure: bestProcedure,
      satisfaction: highestSatisfaction
    };
  }

  // Generate performance insights
  generateInsights() {
    if (!this.metrics.overall) {
      return "No data available for insights";
    }
    
    const insights = [];
    
    // Top performer insight
    const topPerformer = this.metrics.comparative.satisfactionRanking[0];
    insights.push({
      type: "top_performer",
      title: "Top Performer",
      description: `${topPerformer.name} has the highest satisfaction rating at ${topPerformer.satisfaction.toFixed(1)}/5.0`,
      details: `Specializes in ${topPerformer.specialties.join(", ")} with a ${topPerformer.successRate.toFixed(1)}% treatment success rate.`
    });
    
    // Efficiency insight
    const mostEfficient = this.metrics.comparative.efficiencyRanking[0];
    insights.push({
      type: "efficiency",
      title: "Most Efficient",
      description: `${mostEfficient.name} achieves a ${mostEfficient.satisfaction.toFixed(1)}/5.0 rating with only ${mostEfficient.duration} minute appointments`,
      details: `Handles ${mostEfficient.appointmentsPerDay} appointments per day with a ${mostEfficient.successRate.toFixed(1)}% success rate.`
    });
    
    // Time of day insight
    const bestTime = this.getBestTimeOfDay();
    insights.push({
      type: "time_of_day",
      title: "Optimal Appointment Time",
      description: `${bestTime.timeOfDay.charAt(0).toUpperCase() + bestTime.timeOfDay.slice(1)} appointments have the highest satisfaction (${bestTime.satisfaction.toFixed(1)}/5.0)`,
      details: `Consider scheduling high-priority or complex procedures during ${bestTime.timeOfDay} hours.`
    });
    
    // Improvement areas
    const needsImprovement = this.metrics.comparative.improvementAreas;
    if (needsImprovement.length > 0) {
      insights.push({
        type: "improvement",
        title: "Areas for Improvement",
        description: `${needsImprovement.length} dentists have satisfaction ratings below 4.5/5.0`,
        details: `${needsImprovement[0].name} could benefit from mentoring with ${topPerformer.name} to improve satisfaction scores.`
      });
    }
    
    return insights;
  }

  // Generate recommendations for improving performance
  generateRecommendations() {
    if (!this.metrics.overall) {
      return "No data available for recommendations";
    }
    
    const recommendations = [];
    
    // Scheduling recommendation
    const bestTime = this.getBestTimeOfDay();
    recommendations.push({
      type: "scheduling",
      title: "Optimize Appointment Scheduling",
      description: `Schedule complex procedures during ${bestTime.timeOfDay} hours when satisfaction ratings are highest.`
    });
    
    // Mentoring recommendation
    const topPerformer = this.metrics.comparative.satisfactionRanking[0];
    const needsImprovement = this.metrics.comparative.improvementAreas;
    if (needsImprovement.length > 0) {
      recommendations.push({
        type: "mentoring",
        title: "Implement Mentoring Program",
        description: `Pair ${needsImprovement[0].name} with ${topPerformer.name} for mentoring to improve patient satisfaction.`
      });
    }
    
    // Efficiency recommendation
    const leastEfficient = [...this.metrics.comparative.efficiencyRanking].reverse()[0];
    recommendations.push({
      type: "efficiency",
      title: "Improve Appointment Efficiency",
      description: `Help ${leastEfficient.name} reduce appointment duration while maintaining quality of care.`
    });
    
    // Specialization recommendation
    const bestProcedure = this.getBestProcedure();
    recommendations.push({
      type: "specialization",
      title: "Leverage Procedural Strengths",
      description: `Assign more ${bestProcedure.procedure.replace(/_/g, " ")} procedures to specialists with highest ratings in this area.`
    });
    
    return recommendations;
  }
}

// Export the class for use in the main application
export default AgentPerformanceAnalytics;
