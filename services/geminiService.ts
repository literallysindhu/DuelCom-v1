import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Problem, Difficulty, Language } from '../types';

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure the application.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const problemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    starterCode: { type: Type.STRING, description: "Starter function definition in the requested language" },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input: { type: Type.STRING },
          output: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["input", "output"]
      }
    }
  },
  required: ["title", "description", "starterCode", "examples"]
};

export const generateProblem = async (difficulty: Difficulty, language: Language): Promise<Problem> => {
  try {
    const ai = getAI();
    const prompt = `Generate a unique competitive coding problem. 
    Difficulty: ${difficulty}. 
    Language: ${language}.
    The problem should be solvable within 10-15 minutes.
    Provide a clear description, input/output requirements, and starter code that includes the function signature in ${language}.
    For C and C++, provide the includes and the main structure or class if needed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: problemSchema,
        systemInstruction: "You are a senior technical interviewer creating algorithmic challenges.",
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    return {
      id: generateId(),
      difficulty,
      language,
      ...data
    };
  } catch (error) {
    console.error("Failed to generate problem:", error);
    
    // Fallback logic remains same
    let fallbackCode = '';
    switch(language) {
        case Language.PYTHON: fallbackCode = 'def two_sum(nums, target):\n    # Your code here\n    pass'; break;
        case Language.C: fallbackCode = '#include <stdio.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Your code here\n}'; break;
        case Language.CPP: fallbackCode = '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};'; break;
        default: fallbackCode = 'function twoSum(nums, target) {\n  // Your code here\n}';
    }

    return {
      id: 'fallback-01',
      title: 'Two Sum (Offline Fallback)',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: Difficulty.EASY,
      language: language,
      starterCode: fallbackCode,
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }
      ]
    };
  }
};

interface JudgeResult {
  correct: boolean;
  feedback: string;
}

const judgeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    correct: { type: Type.BOOLEAN },
    feedback: { type: Type.STRING }
  },
  required: ["correct", "feedback"]
};

export const judgeSubmission = async (problem: Problem, code: string): Promise<JudgeResult> => {
  try {
    const ai = getAI();
    const prompt = `
    Problem: ${problem.title}
    Description: ${problem.description}
    Language: ${problem.language}
    
    User Solution:
    ${code}
    
    Task: Analyze the code. Does it correctly solve the problem based on logic and potential edge cases? 
    Note: Do not execute the code, but simulate its execution logic. 
    Ignore minor syntax errors if the logic is clearly correct.
    Return a boolean verdict and a short feedback sentence.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: judgeSchema,
      }
    });

    return JSON.parse(response.text || '{"correct": false, "feedback": "Error parsing result"}');

  } catch (error) {
    console.error("Judge failed:", error);
    return {
      correct: false,
      feedback: "System error during evaluation. Please try again."
    };
  }
};

export const compareSolutions = async (
    problem: Problem, 
    codeA: string, 
    codeB: string,
    nameA: string,
    nameB: string
  ): Promise<{ winner: 'A' | 'B' | 'DRAW', reason: string }> => {
    
    try {
      const ai = getAI();
      const comparisonSchema: Schema = {
          type: Type.OBJECT,
          properties: {
            winner: { type: Type.STRING, enum: ['A', 'B', 'DRAW'] },
            reason: { type: Type.STRING }
          },
          required: ["winner", "reason"]
        };
    
      const prompt = `
        You are a competitive coding judge. Compare the following two solutions for the problem: "${problem.title}".
        
        Problem Description: ${problem.description}
    
        ---
        ${nameA}'s Solution (Player A):
        ${codeA}
        ---
        ${nameB}'s Solution (Player B):
        ${codeB}
        ---
        
        Criteria for winning (in order of importance):
        1. Correctness: Does the code solve the problem? If only one is correct, they win.
        2. Time Complexity: If both correct, which has better Big O?
        3. Space Complexity: If time is same, which uses less memory?
        4. Code Quality: Readability and clean practices.
        
        If both are incorrect, declare a DRAW.
        If both are equally good, declare a DRAW.
        
        Return the winner ('A' corresponding to ${nameA}, 'B' corresponding to ${nameB}, or 'DRAW') and a concise reason why.
        IMPORTANT: In the reason, you MUST refer to the players by their names ("${nameA}" and "${nameB}"). Do not use "Player A", "Player B", "Solution A" or "Solution B" in the text response.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: comparisonSchema,
        }
      });
  
      return JSON.parse(response.text || '{"winner": "DRAW", "reason": "Evaluation failed"}');
    } catch (error) {
      console.error("Comparison failed:", error);
      return { winner: 'DRAW', reason: "AI Judge was unavailable." };
    }
  };