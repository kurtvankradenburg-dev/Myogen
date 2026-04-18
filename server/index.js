import app from './app.js';

const PORT = process.env.PORT || 3001;

const provider = process.env.ANTHROPIC_API_KEY ? 'Claude (Anthropic)'
  : process.env.OPENAI_API_KEY ? 'ChatGPT (OpenAI)'
  : process.env.GROQ_API_KEY   ? 'LLaMA 70B (Groq)'
  : 'Ollama (local)';

app.listen(PORT, () => {
  console.log(`\n  Myogen backend  →  http://localhost:${PORT}`);
  console.log(`  AI provider     →  ${provider}\n`);
});
