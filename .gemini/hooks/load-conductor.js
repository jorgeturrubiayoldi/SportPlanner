const fs = require('fs');
const path = require('path');

function getProjectRoot() {
    return process.env.GEMINI_PROJECT_DIR || process.cwd();
}

function readFileSafely(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }
    } catch (e) {
        // Silently fail or log to stderr
    }
    return null;
}

const root = getProjectRoot();
const geminiMd = readFileSafely(path.join(root, 'GEMINI.md'));
const conductorIndex = readFileSafely(path.join(root, 'conductor/index.md'));
const conductorTracks = readFileSafely(path.join(root, 'conductor/tracks.md'));

let context = "--- PROJECT CONTEXT (AUTO-LOADED) ---\n";
if (geminiMd) context += `\n[GEMINI.md]\n${geminiMd}\n`;
if (conductorIndex) context += `\n[conductor/index.md]\n${conductorIndex}\n`;
if (conductorTracks) context += `\n[conductor/tracks.md]\n${conductorTracks}\n`;

const output = {
    hookSpecificOutput: {
        additionalContext: context
    },
    systemMessage: "🚀 SportPlanner Context Loaded (CEO Mode Active)"
};

console.log(JSON.stringify(output));
