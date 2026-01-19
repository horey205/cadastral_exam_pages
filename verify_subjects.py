
import json

with open("questions.js", "r", encoding="utf-8") as f:
    content = f.read()
    
json_part = content[content.find('['):content.rfind(']')+1]
data = json.loads(json_part)

subjects = {}
for q in data:
    s = q.get('subject', 'None')
    subjects[s] = subjects.get(s, 0) + 1

print("Subjects found:", subjects)
