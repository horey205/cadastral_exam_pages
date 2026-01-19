
import json
import re

file_path = "questions.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract JSON
start = content.find('[')
end = content.rfind(']')
json_str = content[start:end+1]
data = json.loads(json_str)

# Subject mapping for 지적산업기사
# 1과목: 지적측량
# 2과목: 응용측량
# 3과목: 토지정보체계론
# 4과목: 지적학
# 5과목: 지적관계법규

subjects = [
    "지적측량",
    "응용측량",
    "토지정보체계론",
    "지적학",
    "지적관계법규"
]

updated_count = 0

for q in data:
    # Get question number from ID (ExamTitle_N) or try to rely on order if grouped by exam
    # My scraper generates ID as "ExamTitle_N" where N is 1-based index in that exam.
    # e.g. "지적산업기사2020822_1"
    
    q_id = q.get('id', '')
    match = re.search(r'_(\d+)$', q_id)
    if match:
        num = int(match.group(1))
        
        # Determine subject index (0-4)
        # Questions 1-20 -> idx 0
        # Questions 21-40 -> idx 1
        # ...
        if 1 <= num <= 100:
            subj_idx = (num - 1) // 20
            if 0 <= subj_idx < 5:
                q['subject'] = subjects[subj_idx]
                updated_count += 1
            else:
                q['subject'] = "기타"
        else:
            q['subject'] = "기타" # Unexpected number > 100
    else:
        # If ID format is weird, fallback?
        # The scraper logic guarantees ID ends with _index.
        pass

print(f"Updated subjects for {updated_count} questions.")

# Save back
new_content = "const questionData = " + json.dumps(data, indent=2, ensure_ascii=False) + ";"
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
