// Health Score API Endpoint
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.getHealthScore = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await admin.database().ref('sensors/latest').once('value');
    const data = snapshot.val();
    
    if (!data) {
      return res.status(404).json({ error: 'No sensor data available' });
    }
    
    // Calculate comprehensive health score
    let score = 100;
    const factors = [];
    
    // Temperature factor (optimal: 20-30°C)
    if (data.temperature < 20 || data.temperature > 30) {
      const penalty = Math.abs(data.temperature - 25) * 2;
      score -= penalty;
      factors.push({
        name: 'Temperature',
        value: data.temperature,
        status: data.temperature >= 20 && data.temperature <= 30 ? 'Good' : 'Poor',
        impact: -penalty
      });
    } else {
      factors.push({
        name: 'Temperature',
        value: data.temperature,
        status: 'Good',
        impact: 0
      });
    }
    
    // pH factor (optimal: 6.5-8.5)
    if (data.ph < 6.5 || data.ph > 8.5) {
      const penalty = Math.abs(data.ph - 7.5) * 10;
      score -= penalty;
      factors.push({
        name: 'pH Level',
        value: data.ph,
        status: data.ph >= 6.5 && data.ph <= 8.5 ? 'Good' : 'Poor',
        impact: -penalty
      });
    } else {
      factors.push({
        name: 'pH Level',
        value: data.ph,
        status: 'Good',
        impact: 0
      });
    }
    
    // Turbidity factor (optimal: <5 NTU)
    if (data.turbidity > 5) {
      const penalty = (data.turbidity - 5) * 3;
      score -= penalty;
      factors.push({
        name: 'Turbidity',
        value: data.turbidity,
        status: data.turbidity <= 5 ? 'Good' : 'Poor',
        impact: -penalty
      });
    } else {
      factors.push({
        name: 'Turbidity',
        value: data.turbidity,
        status: 'Good',
        impact: 0
      });
    }
    
    // Dissolved oxygen factor (optimal: >6 mg/L)
    if (data.dissolvedOxygen < 6) {
      const penalty = (6 - data.dissolvedOxygen) * 5;
      score -= penalty;
      factors.push({
        name: 'Dissolved Oxygen',
        value: data.dissolvedOxygen,
        status: data.dissolvedOxygen >= 6 ? 'Good' : 'Poor',
        impact: -penalty
      });
    } else {
      factors.push({
        name: 'Dissolved Oxygen',
        value: data.dissolvedOxygen,
        status: 'Good',
        impact: 0
      });
    }
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    const healthData = {
      score: score,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      status: score > 70 ? 'Good' : score > 40 ? 'Moderate' : 'Poor',
      factors: factors,
      recommendations: getRecommendations(score, factors)
    };
    
    // Save to database
    await admin.database().ref('health/current').set(healthData);
    
    res.json(healthData);
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getRecommendations(score, factors) {
  const recommendations = [];
  
  factors.forEach(factor => {
    if (factor.status === 'Poor') {
      switch (factor.name) {
        case 'Temperature':
          recommendations.push('Investigate thermal pollution sources');
          break;
        case 'pH Level':
          recommendations.push('Check for chemical contamination');
          break;
        case 'Turbidity':
          recommendations.push('Monitor sediment runoff and algal blooms');
          break;
        case 'Dissolved Oxygen':
          recommendations.push('Investigate organic pollution and eutrophication');
          break;
      }
    }
  });
  
  if (score < 40) {
    recommendations.push('Immediate action required - alert environmental authorities');
  } else if (score < 70) {
    recommendations.push('Increased monitoring recommended');
  }
  
  return recommendations;
}