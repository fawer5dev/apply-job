import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testAPIKey() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY not found');
    process.exit(1);
  }

  console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
  console.log('\n🧪 Testing API key validity...\n');

  // Test with the v1 API endpoint
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ API key is valid!');
      console.log(`\nAvailable models (${data.models?.length || 0}):\n`);
      data.models?.forEach((model: any) => {
        console.log(`  - ${model.name}`);
        console.log(
          `    Methods: ${model.supportedGenerationMethods?.join(', ')}`
        );
      });
    } else {
      console.log('❌ API key test failed:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAPIKey();
