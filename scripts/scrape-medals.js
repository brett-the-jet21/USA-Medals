const https = require('https');
const fs = require('fs');
const url = 'https://www.olympics.com/en/milano-cortina-2026/medals';
https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const medals = [];
    const countryPattern = /([A-Z]{3})([^·]+)·\s*(\d+)\s*·\s*(\d+)\s*·\s*(\d+)/g;
    let match;
    let rank = 1;
    while ((match = countryPattern.exec(data)) !== null) {
      medals.push({
        rank: rank++,
        code: match[1].trim(),
        country: match[2].trim(),
        gold: parseInt(match[3]),
        silver: parseInt(match[4]),
        bronze: parseInt(match[5]),
        total: parseInt(match[3]) + parseInt(match[4]) + parseInt(match[5])
      });
    }
    const output = {
      medals: medals,
      updated: new Date().toISOString(),
      lastUpdated: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'short', timeStyle: 'short' })
    };
    fs.writeFileSync('medals-data.json', JSON.stringify(output, null, 2));
    console.log('Updated ' + medals.length + ' countries at ' + output.lastUpdated);
    console.log('USA:', medals.find(m => m.code === 'USA'));
  });
}).on('error', (err) => {
  console.error('Error fetching medals:', err.message);
});
