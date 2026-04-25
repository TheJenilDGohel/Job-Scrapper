const MatchingEngine = require('./engine');

describe('MatchingEngine', () => {
  let engine;
  const mockProfile = {
    roles: ['flutter developer', 'mobile app developer'],
    skills: ['flutter', 'dart', 'javascript'],
    experience: 2
  };
  
  beforeEach(() => {
    engine = new MatchingEngine(mockProfile);
  });

  test('should initialize with provided profile', () => {
    expect(engine.userProfile).toBeDefined();
    expect(engine.userProfile.skills).toContain('flutter');
  });

  test('should score a perfect flutter match highly', () => {
    const job = {
      jobTitle: 'Senior Flutter Developer',
      description: 'Looking for an expert in Flutter and Dart with experience in mobile apps.',
      url: 'https://example.com/job1'
    };
    
    const results = engine.rankJobs([job]);
    expect(results[0].score).toBeGreaterThan(80);
  });

  test('should penalize non-matching roles', () => {
    const job = {
      jobTitle: 'PHP Backend Developer',
      description: 'Legacy system maintenance using PHP and MySQL.',
      url: 'https://example.com/job2'
    };
    
    const results = engine.rankJobs([job]);
    expect(results[0].score).toBeLessThan(40);
  });
});
