#!/usr/bin/env python3
"""
Comprehensive ELA Content Pack Analyzer - Version 2
Analyzes ELA content which uses 'pages' structure instead of 'passages'
"""

import json
import re
from collections import defaultdict
from pathlib import Path

def check_sight_word_in_text(sight_word, text):
    """Check if sight word appears in text (case-insensitive)"""
    if not text:
        return False
    pattern = r'\b' + re.escape(sight_word) + r'\b'
    return bool(re.search(pattern, text, re.IGNORECASE))

def check_reading_level(text):
    """Basic check for Grade 1 reading level appropriateness"""
    if not text:
        return True, []

    issues = []
    words = text.split()

    # Check for overly long words
    long_words = [w for w in words if len(w.strip('.,!?;:"\'-')) > 12]
    if long_words:
        issues.append(f"Contains potentially complex words: {', '.join(set(long_words[:5]))}")

    # Check sentence length
    sentences = re.split(r'[.!?]+', text)
    long_sentences = [s.strip() for s in sentences if len(s.split()) > 15]
    if long_sentences:
        issues.append(f"Contains long sentences (>15 words): {len(long_sentences)} found")

    return len(issues) == 0, issues

def extract_text_from_page(page):
    """Extract all text content from a page for analysis"""
    texts = []

    # Check passage field
    if 'passage' in page and page['passage']:
        texts.append(page['passage'])

    # Check question text
    if 'question' in page and page['question']:
        texts.append(page['question'])

    # Check slide text
    if 'slides' in page:
        for slide in page['slides']:
            if 'text' in slide and slide['text']:
                texts.append(slide['text'])
            if 'caption' in slide and slide['caption']:
                texts.append(slide['caption'])

    # Check instructions
    if 'instructions' in page and page['instructions']:
        texts.append(page['instructions'])

    # Check content
    if 'content' in page and isinstance(page['content'], str):
        texts.append(page['content'])

    return ' '.join(texts)

def analyze_question_page(page, page_id):
    """Analyze a question page"""
    issues = []

    # Check for required question fields
    if 'question' not in page:
        issues.append("Missing 'question' field")

    if 'correctAnswer' in page:
        if page['correctAnswer'] not in ['a', 'b', 'c', 'd']:
            issues.append(f"Invalid correctAnswer: {page['correctAnswer']}")

    if 'options' in page:
        if len(page['options']) != 4:
            issues.append(f"Expected 4 options, found {len(page['options'])}")

    # Check evidence sentence index
    if 'evidenceSentenceIndex' in page and page['evidenceSentenceIndex'] is not None:
        if not isinstance(page['evidenceSentenceIndex'], int):
            issues.append(f"Invalid evidenceSentenceIndex type: {type(page['evidenceSentenceIndex'])}")

    return issues

def analyze_visual_spec(visual):
    """Check if visual specification is complete"""
    if not visual:
        return []

    issues = []

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
            return None

    all_issues = defaultdict(list)
    stations = data.get('stations', {})

    print(f"\nFound {len(stations)} stations to analyze\n")

    for station_id, station_data in stations.items():
        station_issues = []

        # Get pages for this station
        pages = station_data.get('pages', [])

        # Get sight words for this station (if any)
        station_sight_words = station_data.get('sightWords', [])

        for page_idx, page in enumerate(pages):
            page_id = f"{station_id}.page[{page_idx}]"
            page_type = page.get('type', 'unknown')

            # Extract all text from this page
            page_text = extract_text_from_page(page)

            # Check sightWordFocus if present on the page
            if 'sightWordFocus' in page:
                sight_words = page['sightWordFocus']
                if isinstance(sight_words, str):
                    sight_words = [sight_words]

                for sight_word in sight_words:
                    if not check_sight_word_in_text(sight_word, page_text):
                        station_issues.append({
                            'type': 'SIGHT_WORD_MISSING',
                            'page_id': page_id,
                            'page_type': page_type,
                            'sight_word': sight_word,
                            'text_preview': page_text[:150] + '...' if len(page_text) > 150 else page_text
                        })

            # Check reading level for passages
            if 'passage' in page and page['passage']:
                is_appropriate, level_issues = check_reading_level(page['passage'])
                if not is_appropriate:
                    station_issues.append({
                        'type': 'READING_LEVEL',
                        'page_id': page_id,
                        'page_type': page_type,
                        'issues': level_issues
                    })

            # Check question pages
            if page_type == 'question':
                q_issues = analyze_question_page(page, page_id)
                if q_issues:
                    station_issues.append({
                        'type': 'QUESTION_ERROR',
                        'page_id': page_id,
                        'issues': q_issues
                    })

            # Check visual specifications
            if 'visual' in page:
                visual_issues = analyze_visual_spec(page['visual'])
                if visual_issues:
                    station_issues.append({
                        'type': 'VISUAL_INCOMPLETE',
                        'page_id': page_id,
                        'page_type': page_type,
                        'issues': visual_issues
                    })

            # Check slides for visuals
            if 'slides' in page:
                for slide_idx, slide in enumerate(page['slides']):
                    if 'visual' in slide:
                        visual_issues = analyze_visual_spec(slide['visual'])
                        if visual_issues:
                            station_issues.append({
                                'type': 'VISUAL_INCOMPLETE',
                                'page_id': f"{page_id}.slide[{slide_idx}]",
                                'page_type': page_type,
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

    for station_id, issues in sorted(all_issues.items()):
        print(f"\n{station_id}: {len(issues)} issue(s)")
        for issue in issues:
            issue_type = issue['type']
            issue_counts[issue_type] += 1

            if issue_type == 'SIGHT_WORD_MISSING':
                print(f"  ✗ SIGHT WORD '{issue['sight_word']}' not found in {issue['page_type']} page")
                print(f"    Location: {issue['page_id']}")
                print(f"    Text preview: {issue['text_preview']}")

            elif issue_type == 'READING_LEVEL':
                print(f"  ✗ Reading level concerns in {issue['page_id']} ({issue['page_type']})")
                for i in issue['issues']:
                    print(f"    • {i}")

            elif issue_type == 'QUESTION_ERROR':
                print(f"  ✗ Question error in {issue['page_id']}")
                for i in issue['issues']:
                    print(f"    • {i}")

            elif issue_type == 'VISUAL_INCOMPLETE':
                print(f"  ✗ Visual specification incomplete in {issue['page_id']} ({issue['page_type']})")
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

    if issues:
        output_file = repo_root / "ela_issues_report.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(issues, f, indent=2)
        print(f"\nDetailed report saved to: {output_file}")
