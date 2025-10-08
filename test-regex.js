const pattern = /sk-proj-[a-zA-Z0-9]{20,}/g;
const content = "OPENAI_API_KEY=sk-proj-123456789012345678901234567890";
const matches = content.match(pattern);
console.log('Matches:', matches);
console.log('Pattern:', pattern);
console.log('Content:', content);
