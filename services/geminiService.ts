import { GoogleGenAI, Type } from "@google/genai";
import type { CodeReviewResult } from '../types';
import { TrafficLightScore, VulnerabilityCategory, SeverityLevel } from '../types';

// --- Helper Functions for GitHub API ---

const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1] };
    }
    return null;
  } catch (e) {
    return null; // Invalid URL
  }
};

const fetchFileContent = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        // Not throwing an error here to allow other files to be fetched
        console.error(`Failed to fetch file content from ${url}`);
        return `// Error: Failed to fetch content for this file.`;
    }
    return response.text();
}

const getRepoFiles = async (owner: string, repo: string): Promise<string> => {
    const MAX_FILES_TO_FETCH = 5;
    const MAX_FILE_SIZE_BYTES = 100000; // 100KB limit per file
    const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java', '.html', '.css', '.scss', '.json', 'Dockerfile', '.yml', '.yaml'];
    
    const contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    let response;
    try {
        response = await fetch(contentsUrl);
    } catch (networkError) {
        console.error("Network error fetching from GitHub API:", networkError);
        throw new Error("Could not connect to GitHub. Check your network connection.");
    }

    if (!response.ok) {
        if (response.status === 404) throw new Error("Repository not found. Make sure the URL is correct and the repository is public.");
        if (response.status === 403) throw new Error("GitHub API rate limit exceeded. Please wait a bit before trying again.");
        throw new Error(`Failed to fetch repository contents from GitHub.`);
    }

    const contents = await response.json();
    
    const filesToFetch = contents
        .filter((item: any) => 
            item.type === 'file' &&
            item.size < MAX_FILE_SIZE_BYTES &&
            SUPPORTED_EXTENSIONS.some(ext => item.name.endsWith(ext))
        )
        .slice(0, MAX_FILES_TO_FETCH);

    if (filesToFetch.length === 0) {
        throw new Error("Could not find any supported source code files in the repository's root directory. The vibe is... empty?");
    }

    const fileContents = await Promise.all(
        filesToFetch.map(async (file: any) => {
            const content = await fetchFileContent(file.download_url);
            return `
// Path: ${file.path}
// --- START OF FILE ---
${content}
// --- END OF FILE ---
`;
        })
    );

    return fileContents.join('\n\n');
};

// --- Gemini API Service ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const reviewSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.STRING,
      enum: [TrafficLightScore.Green, TrafficLightScore.Yellow, TrafficLightScore.Red],
      description: "Overall traffic light score for the code.",
    },
    goodVibes: {
        type: Type.ARRAY,
        description: "A checklist of common best practices and whether the code passed them.",
        items: {
            type: Type.OBJECT,
            properties: {
                check: {
                    type: Type.STRING,
                    description: "The description of the check.",
                },
                passed: {
                    type: Type.BOOLEAN,
                    description: "Whether the code passed this check."
                },
            },
            required: ["check", "passed"],
        },
    },
    vulnerabilities: {
      type: Type.ARRAY,
      description: "A list of identified vulnerabilities.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: [VulnerabilityCategory.Security, VulnerabilityCategory.Performance, VulnerabilityCategory.Logic, VulnerabilityCategory.BestPractices],
            description: "The category of the vulnerability.",
          },
          severity: {
            type: Type.STRING,
            enum: [SeverityLevel.Critical, SeverityLevel.High, SeverityLevel.Medium, SeverityLevel.Low],
            description: "The severity of the finding.",
          },
          description: {
            type: Type.STRING,
            description: "A concise description of the vulnerability, improvement, or advisory, including the file path.",
          },
          impact: {
            type: Type.STRING,
            description: "A simple explanation of 'Why this is bad' and its potential impact.",
          },
          remediation: {
            type: Type.STRING,
            description: "A simple, copy-pasteable prompt for a no-code tool to fix the issue or implement the suggestion.",
          },
        },
        required: ["category", "severity", "description", "impact", "remediation"],
      },
    },
  },
  required: ["overallScore", "goodVibes", "vulnerabilities"],
};


export const reviewCode = async (url: string): Promise<CodeReviewResult> => {
  const repoInfo = parseGithubUrl(url);
  if (!repoInfo) {
    throw new Error("Invalid GitHub repository URL. Please use a format like https://github.com/owner/repo.");
  }

  console.log(`Fetching code for ${repoInfo.owner}/${repoInfo.repo}...`);
  const codeToReview = await getRepoFiles(repoInfo.owner, repoInfo.repo);
  
  const prompt = `
    You are 'VibeSmashCode', an expert code reviewer for no-code and vibe-driven developers. Your goal is to provide a helpful and fun code review as fast as possible, aiming for a response in under 5 seconds.
    Your analysis must be returned in two parts: a "Good Vibes Checklist" and a "Detailed Breakdown".

    Code to review:
    \`\`\`
    ${codeToReview}
    \`\`\`

    **Part 1: Good Vibes Checklist**
    First, check the code for the following common mistakes. For the 'goodVibes' array in the JSON, populate it with these exact check descriptions and a 'passed' status of true or false.
    - "No hardcoded API keys or secrets found." (Check for strings that look like keys, e.g., 'sk_live_', 'AIzaSy', etc.)
    - "Code is free of large, commented-out blocks." (Check for big blocks of commented code that indicate dead code.)
    - "Error handling is consistently applied." (Check if 'try...catch' blocks, '.catch()', or other error handlers are used in async operations or sensitive areas.)
    - "Code follows a consistent naming convention." (Check for camelCase, PascalCase, or snake_case consistency.)

    **Part 2: Detailed Breakdown**
    Next, provide a detailed breakdown with exactly TWELVE findings in total.
    1.  You MUST identify exactly THREE items for EACH of the following categories: 'Security', 'Performance', 'Logic', and 'Best Practices'.
    2.  If you cannot find a genuine vulnerability for a category, provide an "improvement suggestion" or "advisory" instead. Frame it constructively. For example, for perfect security, an advisory could be: "Advisory: Consider adding a Content Security Policy (CSP) header for an extra layer of defense."
    3.  For each of the twelve findings, assign a 'severity' level: 'CRITICAL' (a big yikes issue), 'HIGH' (a major glow up opportunity), 'MEDIUM' (a pro-tip), or 'LOW' (a tiny tweak).
    4.  For each finding, provide a concise but clear 'description'. Crucially, mention the file path (e.g., "In 'src/api.js', ...").
    5.  For each finding, provide a simple 'impact' explanation of 'Why this is bad' and its potential negative consequences.
    6.  For each finding, create a simple, copy-pasteable 'remediation' prompt that a no-code developer could use.
    
    **Part 3: Overall Score**
    Based on your findings, determine the 'overallScore' using these specific rules in this exact order:
    1. If ANY finding in the Detailed Breakdown has a 'CRITICAL' severity, the score MUST be 'RED'.
    2. If ANY finding has a 'HIGH' severity (and no 'CRITICAL' ones), the score MUST be 'YELLOW'.
    3. If ALL findings in the Detailed Breakdown have a 'LOW' severity, the score MUST be 'GREEN'. This is the best possible score.
    4. If the "Good Vibes Checklist" is entirely 'passed: true' AND the detailed findings contain 'MEDIUM' severity issues (but no 'HIGH' or 'CRITICAL'), the score should be 'YELLOW'.
    5. In all other cases (e.g., a mix of 'MEDIUM' and 'LOW' severities), the score is 'YELLOW'.

    Respond strictly in the provided JSON format. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
      },
    });

    const jsonString = response.text.trim();
    // A simple check to see if it's likely a JSON object
    if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
        console.error("AI response is not a valid JSON object:", jsonString);
        throw new Error("The AI returned an unexpected response format.");
    }
    const result = JSON.parse(jsonString) as CodeReviewResult;
    return result;

  } catch (error) {
    console.error("Error during code review process:", error);
     if (error instanceof SyntaxError) {
        throw new Error("The AI returned an invalid response. The vibe is off. Please try again.");
    }
    throw new Error(error instanceof Error ? error.message : "Failed to get code review from AI. The vibe is off.");
  }
};