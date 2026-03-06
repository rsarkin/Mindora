const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lint.json', 'utf8'));
const errors = data.filter(f => f.errorCount > 0).map(f => {
    return {
        filePath: f.filePath,
        messages: f.messages.filter(m => m.severity === 2).map(m => 'Line ' + m.line + ': ' + m.ruleId + ' - ' + m.message)
    };
});
console.log(JSON.stringify(errors, null, 2));
