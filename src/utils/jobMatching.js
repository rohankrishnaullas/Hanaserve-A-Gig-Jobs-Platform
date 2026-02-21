// Job matching and skill similarity logic

// Skill categories and related keywords
const SKILL_CATEGORIES = {
  'pet care': ['dog walking', 'pet sitting', 'animal care', 'dog care', 'cat care', 'pet feeding'],
  'childcare': ['babysitting', 'child care', 'tutoring', 'homework help', 'kids', 'children'],
  'shopping': ['grocery shopping', 'buying stuff', 'errands', 'shopping', 'purchases'],
  'companionship': ['company', 'companionship', 'elderly care', 'visiting', 'chatting', 'talking'],
  'tutoring': ['tutoring', 'teaching', 'homework help', 'education', 'learning'],
  'cleaning': ['cleaning', 'housekeeping', 'tidying', 'organizing'],
  'delivery': ['delivery', 'pickup', 'transport', 'moving'],
  'tech help': ['computer help', 'tech support', 'phone help', 'internet help']
};

// Extract keywords from text
const extractKeywords = (text) => {
  const lowerText = text.toLowerCase();
  const keywords = [];
  
  // Check each category
  Object.entries(SKILL_CATEGORIES).forEach(([category, terms]) => {
    terms.forEach(term => {
      if (lowerText.includes(term)) {
        keywords.push(category);
      }
    });
  });
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Find similar skills
export const findSimilarSkills = (userSkills) => {
  const userKeywords = new Set();
  
  // Extract keywords from all user skills
  userSkills.forEach(skill => {
    const keywords = extractKeywords(skill);
    keywords.forEach(k => userKeywords.add(k));
  });
  
  // Find related skills
  const similarSkills = [];
  userKeywords.forEach(keyword => {
    if (SKILL_CATEGORIES[keyword]) {
      SKILL_CATEGORIES[keyword].forEach(term => {
        if (!userSkills.some(s => s.toLowerCase().includes(term))) {
          similarSkills.push(term);
        }
      });
    }
  });
  
  return [...new Set(similarSkills)].slice(0, 3); // Return top 3 unique suggestions
};

// Match providers to job requests
export const matchProvidersToJob = (jobRequest, allProviders) => {
  const jobKeywords = extractKeywords(jobRequest.description);
  const matches = [];
  
  allProviders.forEach(provider => {
    if (!provider.location || !jobRequest.location) {
      return; // Skip if location not set
    }
    
    // Calculate distance (simplified for V0.1 - using city match)
    const isNearby = provider.location.city === jobRequest.location.city ||
                     calculateDistance(provider.location, jobRequest.location) < 10; // 10km radius
    
    if (!isNearby) {
      return;
    }
    
    // Check skill match
    const providerKeywords = new Set();
    provider.skills.forEach(skill => {
      extractKeywords(skill).forEach(k => providerKeywords.add(k));
    });
    
    const matchingKeywords = jobKeywords.filter(k => providerKeywords.has(k));
    const matchScore = matchingKeywords.length / Math.max(jobKeywords.length, 1);
    
    if (matchScore > 0.3) { // At least 30% match
      matches.push({
        provider,
        matchScore,
        matchingKeywords
      });
    }
  });
  
  // Sort by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  return matches.map(m => m.provider);
};

// Calculate distance between two locations (Haversine formula - simplified)
const calculateDistance = (loc1, loc2) => {
  if (!loc1.lat || !loc2.lat) {
    // If same city, assume close
    return loc1.city === loc2.city ? 5 : 50;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lon - loc2.lon) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Determine hourly rate based on job type
export const getJobRate = (jobDescription) => {
  const lowerDesc = jobDescription.toLowerCase();
  
  // Rate ranges (in USD for V0.1)
  if (lowerDesc.includes('tutoring') || lowerDesc.includes('teaching')) {
    return { min: 20, max: 40, suggested: 30 };
  }
  if (lowerDesc.includes('babysitting') || lowerDesc.includes('childcare')) {
    return { min: 15, max: 25, suggested: 20 };
  }
  if (lowerDesc.includes('pet') || lowerDesc.includes('dog')) {
    return { min: 12, max: 20, suggested: 15 };
  }
  if (lowerDesc.includes('companionship') || lowerDesc.includes('elderly')) {
    return { min: 10, max: 18, suggested: 14 };
  }
  if (lowerDesc.includes('shopping') || lowerDesc.includes('errands')) {
    return { min: 10, max: 15, suggested: 12 };
  }
  if (lowerDesc.includes('cleaning')) {
    return { min: 15, max: 25, suggested: 20 };
  }
  
  // Default rate
  return { min: 10, max: 20, suggested: 15 };
};
