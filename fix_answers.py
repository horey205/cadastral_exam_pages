import json
import re
import os
from collections import defaultdict

def apply_correct_answers():
    script_path = r'c:\AI_Class\자격증기출\cada_offcie_exam_testing\tools\update_all_answers.py'
    extracted_ans = defaultdict(list)
    extracted_ans_by_id = {}
    
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Pattern: "p5_c0_q20": [4, "..."]
    matches = re.finditer(r'"(p\d+_c\d+)_q(\d+)":\s*\[(\d+),\s*"', content)
    for m in matches:
        prefix = m.group(1)
        full_id = f"{prefix}_q{m.group(2)}"
        ans = int(m.group(3))
        start_pos = m.end()
        end_pos = start_pos
        while end_pos < len(content):
            if content[end_pos] == '"' and content[end_pos-1] != '\\':
                break
            end_pos += 1
        explanation = content[start_pos:end_pos].replace('\\"', '"')
        extracted_ans[prefix].append([ans, explanation])
        extracted_ans_by_id[full_id] = [ans, explanation]

    print(f"Extracted answer groups for {len(extracted_ans)} page-columns.")

    target_files = [
        r'c:\AI_Class\자격증기출\cada_offcie_exam_testing\official_survey.json',
        r'c:\AI_Class\자격증기출\cada_offcie_exam_testing\official_cs.json'
    ]

    total_updated = 0
    for file_path in target_files:
        if not os.path.exists(file_path): continue
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        count = 0
        
        # Strategy A: Direct Match (for cs format)
        for item in data:
            if item['id'] in extracted_ans_by_id:
                val = extracted_ans_by_id[item['id']]
                item['answer'] = val[0]
                item['explanation'] = f"## [정답 확인] {val[0]}번\n\n{val[1]}"
                count += 1
                item['_updated'] = True

        # Strategy B: Group match (for survey format)
        json_groups = defaultdict(list)
        for item in data:
            if item.get('_updated'): continue
            # Look for p3_c0_1 pattern
            m = re.match(r'(p\d+_c\d+)_(\d+)', item['id'])
            if m:
                json_groups[m.group(1)].append(item)

        for prefix, items in json_groups.items():
            if prefix in extracted_ans:
                ans_list = extracted_ans[prefix]
                # We need to be careful with the offset. 
                # If the script has q0 to q9 for p3_c0 and p3_c1 combined? 
                # No, prefix is p3_c0.
                # Let's just try to match them in order of the local index
                for i in range(min(len(items), len(ans_list))):
                    items[i]['answer'] = ans_list[i][0]
                    items[i]['explanation'] = f"## [정답 확인] {ans_list[i][0]}번\n\n{ans_list[i][1]}"
                    count += 1
        
        # Cleanup
        for item in data:
            if '_updated' in item: del item['_updated']

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {count} items in {os.path.basename(file_path)}")
        total_updated += count

    # Rebuild quiz_app/questions.json and questions.js
    print("Rebuilding questions.js...")
    merged_data = []
    for f_name in ['official_survey.json', 'official_cs.json', 'custom_survey.json', 'custom_cs.json']:
        p = os.path.join(r'c:\AI_Class\자격증기출\cada_offcie_exam_testing', f_name)
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as f:
                try: merged_data.extend(json.load(f))
                except: pass
    
    with open(r'c:\AI_Class\자격증기출\cada_offcie_exam_testing\quiz_app\questions.json', 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    with open(r'c:\AI_Class\자격증기출\cada_offcie_exam_testing\questions.js', 'w', encoding='utf-8') as f:
        f.write(f"const questionData = {json.dumps(merged_data, ensure_ascii=False)};")
        
    print(f"Successfully updated total {total_updated} questions.")

if __name__ == "__main__":
    apply_correct_answers()
