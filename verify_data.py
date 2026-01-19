
import json

with open("questions.js", "r", encoding="utf-8") as f:
    content = f.read()
    
# Strip "const questionData = " and ";"
json_part = content[content.find('['):content.rfind(']')+1]
data = json.loads(json_part)

print(f"Total questions: {len(data)}")
print(f"Sample Question 1: {data[0]['text']}")
print(f"Sample Image path: {data[0].get('image')}")

# Check for a question with image
for q in data:
    if q.get('image'):
        print(f"Found image in q {q['id']}: {q['image']}")
        break
