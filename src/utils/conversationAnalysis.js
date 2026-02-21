const SKILL_KEYWORDS = [
  'clean', 'cleaning', 'house', 'housekeeping', 'grocery', 'shopping', 'delivery',
  'dog', 'pet', 'walk', 'walking', 'tutor', 'teaching', 'math', 'science', 'child',
  'babysit', 'care', 'yard', 'lawn', 'moving', 'lift', 'car', 'wash', 'cook', 'driving',
  'tech', 'computer', 'repair', 'setup', 'plumbing', 'electric', 'paint', 'handyman'
];

const QUALIFICATION_KEYWORDS = [
  'certified', 'license', 'licensed', 'experienced', 'years', 'degree', 'trained'
];

const INTEREST_KEYWORDS = ['weekend', 'evening', 'remote', 'in-person', 'nearby', 'flexible'];

const uniqueList = (items) => Array.from(new Set(items.filter(Boolean).map(i => i.trim())));

const pickSentences = (text, max = 2) => {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, max).join(' ').trim();
};

const extractMatches = (text, keywords) => {
  const lower = text.toLowerCase();
  return keywords.filter(k => lower.includes(k));
};

const extractFreeformSkills = (text) => {
  return text
    .split(/,|and|also|can\s+do|skills?\s+include/gi)
    .map(part => part.replace(/[^a-zA-Z\s]/g, '').trim())
    .filter(part => part.length > 2);
};

const queryOllama = async (prompt) => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'phi3', prompt, stream: false })
    });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama not available, falling back to keyword analysis:', error);
    return null;
  }
};

export const analyzeProviderConversation = async (transcript, existingSkills = []) => {
  if (!transcript || transcript.trim().length === 0) {
    return {
      summary: '',
      skills: existingSkills,
      qualifications: [],
      interests: [],
      followUpQuestions: []
    };
  }

  // Try SLM analysis first
  const prompt = `Analyze this transcript from a service provider describing their skills: "${transcript}". 
  Extract: 
  - Summary: A brief summary in 1-2 sentences.
  - Skills: List of skills mentioned (comma-separated).
  - Qualifications: Any certifications or experience mentioned (comma-separated).
  - Interests: Preferences like remote, in-person, flexible hours (comma-separated).
  Format as JSON: {"summary": "...", "skills": ["skill1", "skill2"], "qualifications": ["qual1"], "interests": ["int1"]}`;

  const llmResponse = await queryOllama(prompt);
  if (llmResponse) {
    try {
      const parsed = JSON.parse(llmResponse);
      const skills = uniqueList([...existingSkills, ...parsed.skills]).slice(0, 15);
      const followUpQuestions = [
        skills.length > 0
          ? `Are you willing to take quick gigs related to ${skills.slice(0, 2).join(' and ')} this week?`
          : 'Are you open to short, same-day gigs if they come up?',
        'Can you work evenings or weekends if needed?',
        'Are you open to jobs within a short travel distance from you?'
      ];
      return {
        summary: parsed.summary,
        skills,
        qualifications: uniqueList(parsed.qualifications),
        interests: uniqueList(parsed.interests),
        followUpQuestions
      };
    } catch (e) {
      console.error('Failed to parse LLM response:', e);
    }
  }

  // Fallback to original keyword-based analysis
  const summary = pickSentences(transcript, 3);
  const keywordSkills = extractMatches(transcript, SKILL_KEYWORDS);
  const freeformSkills = extractFreeformSkills(transcript);
  const qualifications = extractMatches(transcript, QUALIFICATION_KEYWORDS);
  const interests = extractMatches(transcript, INTEREST_KEYWORDS);

  const skills = uniqueList([...existingSkills, ...keywordSkills, ...freeformSkills])
    .slice(0, 15); // keep list short

  const followUpQuestions = [
    skills.length > 0
      ? `Are you willing to take quick gigs related to ${skills.slice(0, 2).join(' and ')} this week?`
      : 'Are you open to short, same-day gigs if they come up?',
    'Can you work evenings or weekends if needed?',
    'Are you open to jobs within a short travel distance from you?'
  ];

  return {
    summary,
    skills,
    qualifications: uniqueList(qualifications),
    interests: uniqueList(interests),
    followUpQuestions
  };
};


