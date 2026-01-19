const fs = require('fs');

// Load questions
const content = fs.readFileSync('questions.js', 'utf8');
const start = content.indexOf('[');
const end = content.lastIndexOf(']');
const allQuestions = JSON.parse(content.substring(start, end + 1));

console.log(`Loaded ${allQuestions.length} questions`);

// Group by subject
const bySubject = {
    '지적측량': [],
    '응용측량': [],
    '토지정보체계론': [],
    '지적학': [],
    '지적관계법규': []
};

allQuestions.forEach(q => {
    if (bySubject[q.subject]) {
        bySubject[q.subject].push(q);
    }
});

// Save each subject as separate JSON file
Object.keys(bySubject).forEach(subject => {
    const questions = bySubject[subject];
    if (questions.length > 0) {
        const filename = `${subject}.json`;
        fs.writeFileSync(filename, JSON.stringify(questions, null, 2), 'utf8');
        console.log(`${subject}: ${questions.length} questions -> ${filename}`);
    }
});

console.log('\nAll subject files created!');
