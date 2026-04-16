const fs = require('fs');
const content = fs.readFileSync('app/components/automation/sequence/SequenceListPage.tsx', 'utf8');
const startMatch = content.indexOf('<div className="bg-white min-w-[900px]">');
const endMatch = content.indexOf('{/* Create modal */}');
console.log({ startMatch, endMatch });
