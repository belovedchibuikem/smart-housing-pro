const fs = require('fs');
const path = require('path');

// Create .env.local file with API base URL
const envContent = 'NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api\n';
const envPath = path.join(__dirname, '.env.local');

fs.writeFileSync(envPath, envContent);
console.log('✅ Environment file created: .env.local');
console.log('✅ API Base URL set to: http://127.0.0.1:8000/api');
console.log('Please restart your Next.js development server for changes to take effect.');
