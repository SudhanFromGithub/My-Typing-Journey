const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const APE_KEY = process.env.APE_KEY;
const API_URL = 'https://api.monkeytype.com/users/personalBests?mode=time';

async function fetchPersonalBests() {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `ApeKey ${APE_KEY}`
      }
    });

    const personalBests = response.data;
    // Log full response for debugging
    console.log('API Response:', JSON.stringify(personalBests, null, 2));

    // Extract WPM for 30-second English test
    const pb30 = personalBests?.data?.['30']?.[0]?.wpm || 'N/A';

    // Provide detailed feedback if N/A
    if (pb30 === 'N/A') {
      console.log('No 30-second English personal best found. Please complete a 30-second English test on Monkeytype.');
      if (!personalBests?.data) {
        console.log('No time-based personal bests found in API response.');
      } else if (!personalBests.data['30']) {
        console.log('No 30-second test data found. Available durations:', Object.keys(personalBests.data));
      } else if (!personalBests.data['30'][0]) {
        console.log('No personal best entries for 30-second test.');
      }
    }

    // Format the Monkeytype section
    const monkeytypeSection = `
## My Monkeytype 30-Second Personal Best 🐒

- **30 Seconds (English)**: ${pb30} WPM
    `;

    // Read existing README
    let readmeContent = '';
    try {
      readmeContent = fs.readFileSync('README.md', 'utf8');
    } catch (error) {
      console.log('No existing README found, creating new one.');
    }

    // Check if Monkeytype section exists
    const sectionRegex = /## My Monkeytype 30-Second Personal Best 🐒[\s\S]*?(?=\n##|$)/;
    if (sectionRegex.test(readmeContent)) {
      // Replace existing section
      readmeContent = readmeContent.replace(sectionRegex, monkeytypeSection);
    } else {
      // Append section if it doesn't exist
      readmeContent += '\n' + monkeytypeSection;
    }

    const monkeytypeSection = `![Monkeytype 30s](https://img.shields.io/badge/Monkeytype_30s-${pb30}_WPM-blue)`;

    const marker = '<!-- MONKEYTYPE -->';
if (readmeContent.includes(marker)) {
  readmeContent = readmeContent.replace(marker, monkeytypeSection);
} else {
  readmeContent += '\n' + monkeytypeSection;
}

    // Write updated content back to README
    fs.writeFileSync('README.md', readmeContent);
    console.log('README updated with 30-second personal best!');
  } catch (error) {
    console.error('Error fetching personal best:', error.response?.data || error.message);
  }
}

fetchPersonalBests();