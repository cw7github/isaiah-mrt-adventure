#!/usr/bin/env python3
"""
Comprehensive ELA Content Pack Analyzer
Checks for issues similar to those found in math content:
1. sightWordFocus words must appear in passages (case-insensitive)
2. Reading level appropriateness for Grade 1
3. Questions have correct answer references
4. Visual specifications are complete
5. JSON validity
"""

import json
import re
from collections import defaultdict
from pathlib import Path

def check_sight_word_in_passage(sight_word, passage):
    """Check if sight word appears in passage (case-insensitive)"""
    if not passage:
        return False
    # Create regex pattern that matches whole word boundaries
    pattern = r'\b' + re.escape(sight_word) + r'\b'
    return bool(re.search(pattern, passage, re.IGNORECASE))

def check_reading_level(passage):
    """Basic check for Grade 1 reading level appropriateness"""
    if not passage:
        return True, []

    issues = []
    words = passage.split()

    # Check for overly long words (Grade 1 typically has 1-2 syllable words mostly)
    long_words = [w for w in words if len(w.strip('.,!?;:"\'-')) > 12]
    if long_words:
        issues.append(f"Contains potentially complex words: {', '.join(long_words[:5])}")

    # Check sentence length (Grade 1 sentences typically 5-10 words)
    sentences = re.split(r'[.!?]+', passage)
    long_sentences = [s.strip() for s in sentences if len(s.split()) > 15]
    if long_sentences:
        issues.append(f"Contains long sentences (>15 words): {len(long_sentences)} found")

    return len(issues) == 0, issues

def analyze_question(question, passage_id):
    """Analyze question for correctness"""
    issues = []

    # Check if question has required fields
    if 'question' not in question:
        issues.append("Missing 'question' field")

    if 'correctAnswer' not in question:
        issues.append("Missing 'correctAnswer' field")
    elif question['correctAnswer'] not in ['a', 'b', 'c', 'd']:
        issues.append(f"Invalid correctAnswer: {question['correctAnswer']}")

    if 'options' not in question:
        issues.append("Missing 'options' field")
    elif len(question['options']) != 4:
        issues.append(f"Expected 4 options, found {len(question['options'])}")

    # Check if evidence is provided when required
    if 'evidenceSentenceIndex' in question and question['evidenceSentenceIndex'] is not None:
        if not isinstance(question['evidenceSentenceIndex'], int):
            issues.append(f"Invalid evidenceSentenceIndex type: {type(question['evidenceSentenceIndex'])}")

    return issues

def analyze_visual_spec(visual):
    """Check if visual specification is complete"""
    if not visual:
        return []

    issues = []

    # Check required fields based on visual type
    if 'type' not in visual:
        issues.append("Missing 'type' field")
        return issues

    visual_type = visual['type']

    if visual_type == 'image':
        if 'description' not in visual or not visual['description']:
            issues.append("Image missing description")
    elif visual_type == 'illustration':
        if 'description' not in visual or not visual['description']:
            issues.append("Illustration missing description")
        if 'style' not in visual:
            issues.append("Illustration missing style")

    return issues

def analyze_content_pack(file_path):
    """Main analysis function"""
    print(f"Analyzing {file_path}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERROR: Invalid JSON: {e}")
            return

    all_issues = defaultdict(list)
    stations = data.get('stations', {})

    print(f"\nFound {len(stations)} stations to analyze\n")

    for station_id, station_data in stations.items():
        station_issues = []

        # Get passages for this station
        passages = station_data.get('passages', [])

        for idx, passage_obj in enumerate(passages):
            passage_id = f"{station_id}.passage[{idx}]"

            # Check sightWordFocus
            if 'sightWordFocus' in passage_obj:
                sight_words = passage_obj['sightWordFocus']
                if isinstance(sight_words, str):
                    sight_words = [sight_words]

                passage_text = passage_obj.get('passage', '')

                for sight_word in sight_words:
                    if not check_sight_word_in_passage(sight_word, passage_text):
                        station_issues.append({
                            'type': 'SIGHT_WORD_MISSING',
                            'passage_id': passage_id,
                            'sight_word': sight_word,
                            'passage_preview': passage_text[:100] + '...' if len(passage_text) > 100 else passage_text
                        })

            # Check reading level
            passage_text = passage_obj.get('passage', '')
            is_appropriate, level_issues = check_reading_level(passage_text)
            if not is_appropriate:
                station_issues.append({
                    'type': 'READING_LEVEL',
                    'passage_id': passage_id,
                    'issues': level_issues
                })

            # Check questions
            questions = passage_obj.get('questions', [])
            for q_idx, question in enumerate(questions):
                q_issues = analyze_question(question, passage_id)
                if q_issues:
                    station_issues.append({
                        'type': 'QUESTION_ERROR',
                        'passage_id': passage_id,
                        'question_idx': q_idx,
                        'issues': q_issues
                    })

            # Check visual specifications
            if 'visual' in passage_obj:
                visual_issues = analyze_visual_spec(passage_obj['visual'])
                if visual_issues:
                    station_issues.append({
                        'type': 'VISUAL_INCOMPLETE',
                        'passage_id': passage_id,
                        'issues': visual_issues
                    })

        if station_issues:
            all_issues[station_id] = station_issues

    # Print summary
    print("=" * 80)
    print("ANALYSIS SUMMARY")
    print("=" * 80)

    if not all_issues:
        print("\n✓ No issues found! All content passes validation.")
        return all_issues

    print(f"\nFound issues in {len(all_issues)} stations:\n")

    issue_counts = defaultdict(int)

    for station_id, issues in all_issues.items():
        print(f"\n{station_id}: {len(issues)} issue(s)")
        for issue in issues:
            issue_type = issue['type']
            issue_counts[issue_type] += 1

            if issue_type == 'SIGHT_WORD_MISSING':
                print(f"  - SIGHT WORD '{issue['sight_word']}' not found in passage")
                print(f"    Passage: {issue['passage_id']}")
                print(f"    Preview: {issue['passage_preview']}")

            elif issue_type == 'READING_LEVEL':
                print(f"  - Reading level concerns in {issue['passage_id']}")
                for i in issue['issues']:
                    print(f"    • {i}")

            elif issue_type == 'QUESTION_ERROR':
                print(f"  - Question {issue['question_idx']} in {issue['passage_id']}")
                for i in issue['issues']:
                    print(f"    • {i}")

            elif issue_type == 'VISUAL_INCOMPLETE':
                print(f"  - Visual specification incomplete in {issue['passage_id']}")
                for i in issue['issues']:
                    print(f"    • {i}")

    print("\n" + "=" * 80)
    print("ISSUE TYPE SUMMARY")
    print("=" * 80)
    for issue_type, count in sorted(issue_counts.items()):
        print(f"{issue_type}: {count}")

    return all_issues

if __name__ == "__main__":
    repo_root = Path(__file__).resolve().parent
    file_path = repo_root / "content/cpa-grade1-ela/content-pack.v1.json"
    issues = analyze_content_pack(str(file_path))

    # Save issues to JSON for programmatic fixing
    if issues:
        output_file = repo_root / "ela_issues_report.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(issues, f, indent=2)
        print(f"\nDetailed report saved to: {output_file}")
