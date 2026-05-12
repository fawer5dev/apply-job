/**
 * List available Google AI models
 */
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✅ API Key found');
  console.log('🔍 Listing available models...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Use the REST API directly to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      console.error('❌ Failed to list models');
      console.error('Status:', response.status);
      const text = await response.text();
      console.error('Response:', text);
      process.exit(1);
    }

    const data = await response.json();

    console.log('📋 Available models:\n');
    if (data.models && data.models.length > 0) {
      data.models.forEach((model) => {
        console.log(`  • ${model.name}`);
        console.log(`    Display Name: ${model.displayName}`);
        console.log(`    Description: ${model.description}`);
        if (model.supportedGenerationMethods) {
          console.log(
            `    Supported Methods: ${model.supportedGenerationMethods.join(', ')}`
          );
        }
        console.log('');
      });
    } else {
      console.log('No models found');
    }

    // Try to find a working model
    const workingModels = data.models?.filter((m) =>
      m.supportedGenerationMethods?.includes('generateContent')
    );

    if (workingModels && workingModels.length > 0) {
      console.log('\n✅ Models that support generateContent:');
      workingModels.forEach((m) => {
        // Extract just the model name from "models/gemini-..."
        const modelName = m.name.replace('models/', '');
        console.log(`  • ${modelName}`);
      });
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    process.exit(1);
  }
}

listModels();
