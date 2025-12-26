#!/usr/bin/env python3
"""
Fix vocabulary stations V1-V5 to improve:
1. Vocabulary pedagogy (meaningful contexts, grade-appropriate definitions)
2. Skill transfer (explicit teaching of strategies)
3. Question quality (semantic distractors, proper assessment)
4. Standard coverage (all L.1.4 and L.1.5 sub-standards)
"""

import json
import sys
from pathlib import Path

def fix_v1_context_word_parts(station):
    """
    Fix V1 to properly teach:
    - L.1.4.A: Context clues (with actual inference, not just definitions)
    - L.1.4.B: Prefixes and suffixes (with explicit meaning teaching)
    - L.1.4.C: Root words (already good)
    """

    # Add prefix/suffix words to preview
    station['previewWords'].insert(2, {
        "word": "redo",
        "icon": "🔄",
        "isSightWord": False,
        "phonicsNote": "re-do"
    })

    # Improve pages: add explicit prefix/suffix teaching and better context clues
    station['pages'] = [
        # Page 1: Context clues (keep good definition example)
        {
            "type": "read",
            "image": "🎲🧠",
            "sentence": "The playful puppy runs and jumps all day.",
            "targetWords": ["playful", "puppy", "runs", "jumps"],
            "sightWordFocus": "the",
            "readingTip": "Use the sentence to figure out what playful means.",
            "ui": {
                "scene": "arrival",
                "backgroundImageSuggested": True,
                "imagePrompt": "Happy puppy running and playing."
            }
        },
        # Page 2: Teach PREFIX explicitly
        {
            "type": "read",
            "image": "😊😢",
            "sentence": "She was happy. Then she was unhappy.",
            "targetWords": ["happy", "unhappy"],
            "sightWordFocus": "was",
            "readingTip": "Un at the start means NOT.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Two faces: happy then sad, with un- highlighted."
            }
        },
        # Page 3: Teach SUFFIX explicitly
        {
            "type": "read",
            "image": "🦘🏃",
            "sentence": "I jump. I am jumping now.",
            "targetWords": ["jump", "jumping", "now"],
            "sightWordFocus": "am",
            "readingTip": "The ending ing means doing it now.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Person mid-jump with -ing highlighted."
            }
        },
        # Page 4: Root words teaching
        {
            "type": "read",
            "image": "🌱🔄",
            "sentence": "The root word help is in helping, helped, and helper.",
            "targetWords": ["root", "help", "helping", "helped", "helper"],
            "sightWordFocus": "is",
            "readingTip": "Find the root word to know the meaning.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Word tree showing help with different endings."
            }
        },
        # Menu
        {
            "type": "menu",
            "prompt": "Pick a strategy!",
            "menuStory": "How can you figure out a word?",
            "items": [
                {"name": "Use the sentence", "icon": "📖", "description": "context clue"},
                {"name": "Look at word parts", "icon": "🧩", "description": "prefix or suffix"},
                {"name": "Find the root word", "icon": "🌱", "description": "base word"}
            ],
            "ui": {
                "scene": "choice",
                "backgroundImageSuggested": True,
                "imagePrompt": "Three strategy cards."
            }
        },
        # Q1: Context clue (inference, not just definition)
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "What does playful mean?",
            "passage": "The playful puppy runs and jumps all day.",
            "comprehensionHint": "What does the puppy do? That shows playful.",
            "answers": [
                {"name": "Likes to play", "icon": "🎲"},
                {"name": "Likes to sleep", "icon": "😴"},
                {"name": "Likes to eat", "icon": "🍖"}
            ],
            "correctAnswerName": "Likes to play",
            "successMessage": "Yes! You used the sentence clue."
        },
        # Q2: Prefix meaning (explicit un- = not)
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "What does un mean in unhappy?",
            "passage": "She was happy. Then she was unhappy.",
            "comprehensionHint": "Un changes happy to the opposite.",
            "answers": [
                {"name": "not", "icon": "🚫"},
                {"name": "very", "icon": "⭐"},
                {"name": "little", "icon": "🤏"}
            ],
            "correctAnswerName": "not",
            "successMessage": "Yes! Un means not."
        },
        # Q3: Suffix meaning (explicit -ing = happening now)
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "What does ing mean in jumping?",
            "passage": "I jump. I am jumping now.",
            "comprehensionHint": "The ending ing tells when it happens.",
            "answers": [
                {"name": "doing it now", "icon": "⏱️"},
                {"name": "did it before", "icon": "⏮️"},
                {"name": "will do it later", "icon": "⏭️"}
            ],
            "correctAnswerName": "doing it now",
            "successMessage": "Yes! Ing means doing it now."
        },
        # Q4: Root word identification
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "What is the root word in helper?",
            "passage": "The root word help is in helping, helped, and helper.",
            "comprehensionHint": "Look for the smallest word that makes sense.",
            "answers": [
                {"name": "help", "icon": "🌱"},
                {"name": "er", "icon": "🧩"},
                {"name": "helper", "icon": "👷"}
            ],
            "correctAnswerName": "help",
            "successMessage": "Nice! Help is the root word."
        },
        # Q5: Apply context clues to new word
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "What does redo mean?",
            "passage": "I will redo my work. I will do it again.",
            "comprehensionHint": "Use the second sentence as a clue.",
            "answers": [
                {"name": "do again", "icon": "🔄"},
                {"name": "do first", "icon": "1️⃣"},
                {"name": "stop doing", "icon": "🛑"}
            ],
            "correctAnswerName": "do again",
            "successMessage": "Great! You used context and the prefix re!"
        }
    ]

    return station


def fix_v4_shades_of_meaning(station):
    """
    Fix V4 to properly teach:
    - L.1.5.D: Verb shades of meaning (already has peek/stare)
    - L.1.5.E: Adjective shades of meaning (MISSING - need to add)

    Critical: Must cover BOTH verbs AND adjectives
    """

    # Update checklist targets to include L.1.5.E explicitly
    if "L.1.5.E" not in station['checklistTargets']:
        station['checklistTargets'].append("L.1.5.E")

    # Add more adjective words to preview
    station['previewWords'].append({
        "word": "tiny",
        "icon": "🐜",
        "isSightWord": False,
        "phonicsNote": "ti-ny"
    })

    # Add sight words for adjectives
    station['sightWords'].extend(["small", "tiny", "huge"])

    # Improve pages to explicitly teach BOTH verb and adjective shades
    station['pages'] = [
        # Page 1: Verb intensity introduction
        {
            "type": "read",
            "image": "👀🌈",
            "sentence": "Look, peek, and stare are all ways to see.",
            "targetWords": ["Look", "peek", "stare", "ways", "see"],
            "sightWordFocus": "are",
            "readingTip": "Some words mean almost the same thing.",
            "ui": {
                "scene": "arrival",
                "backgroundImageSuggested": True,
                "imagePrompt": "Three eye icons showing different looking intensity."
            }
        },
        # Page 2: Verb ordering by intensity
        {
            "type": "read",
            "image": "👁️⏱️",
            "sentence": "Peek is quick. Look is longer. Stare is very long.",
            "targetWords": ["Peek", "quick", "Look", "longer", "Stare", "long"],
            "sightWordFocus": "is",
            "readingTip": "Order the words from weakest to strongest.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Timeline showing peek, look, stare with arrows."
            }
        },
        # Page 3: Adjective intensity introduction
        {
            "type": "read",
            "image": "🐜📦🐘",
            "sentence": "Tiny, big, and gigantic all mean large.",
            "targetWords": ["Tiny", "big", "gigantic", "mean", "large"],
            "sightWordFocus": "all",
            "readingTip": "Words can show different amounts.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Three objects: ant, box, elephant showing size."
            }
        },
        # Page 4: Adjective ordering by intensity
        {
            "type": "read",
            "image": "📏🔢",
            "sentence": "Tiny is smallest. Big is larger. Gigantic is the biggest.",
            "targetWords": ["Tiny", "smallest", "Big", "larger", "Gigantic", "biggest"],
            "sightWordFocus": "the",
            "readingTip": "Put size words in order from small to big.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Size ladder: tiny → big → gigantic."
            }
        },
        # Menu
        {
            "type": "menu",
            "prompt": "Pick a word type!",
            "menuStory": "Words can be close in meaning.",
            "items": [
                {"name": "Action words", "icon": "👀", "description": "peek, look, stare"},
                {"name": "Size words", "icon": "📏", "description": "tiny, big, gigantic"},
                {"name": "Feeling words", "icon": "😊", "description": "happy, glad, joyful"}
            ],
            "ui": {
                "scene": "choice",
                "backgroundImageSuggested": True,
                "imagePrompt": "Three category cards."
            }
        },
        # Q1: Verb - weakest
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "Which word means look quickly?",
            "passage": "Peek is quick. Look is longer. Stare is very long.",
            "comprehensionHint": "Find the word that is quick.",
            "answers": [
                {"name": "peek", "icon": "👀"},
                {"name": "look", "icon": "👁️"},
                {"name": "stare", "icon": "😳"}
            ],
            "correctAnswerName": "peek",
            "successMessage": "Yes! Peek is the quickest way to look."
        },
        # Q2: Verb - strongest
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "Which word means look the longest?",
            "passage": "Peek is quick. Look is longer. Stare is very long.",
            "comprehensionHint": "Find the strongest word.",
            "answers": [
                {"name": "stare", "icon": "😳"},
                {"name": "look", "icon": "👁️"},
                {"name": "peek", "icon": "👀"}
            ],
            "correctAnswerName": "stare",
            "successMessage": "Yes! Stare is the longest way to look."
        },
        # Q3: Adjective - weakest
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "Which word means the smallest?",
            "passage": "Tiny is smallest. Big is larger. Gigantic is the biggest.",
            "comprehensionHint": "Find the word for the smallest size.",
            "answers": [
                {"name": "tiny", "icon": "🐜"},
                {"name": "big", "icon": "📦"},
                {"name": "gigantic", "icon": "🐘"}
            ],
            "correctAnswerName": "tiny",
            "successMessage": "Yes! Tiny means very small."
        },
        # Q4: Adjective - strongest
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "Which word means the biggest?",
            "passage": "Tiny is smallest. Big is larger. Gigantic is the biggest.",
            "comprehensionHint": "Find the strongest size word.",
            "answers": [
                {"name": "gigantic", "icon": "🐘"},
                {"name": "big", "icon": "📦"},
                {"name": "tiny", "icon": "🐜"}
            ],
            "correctAnswerName": "gigantic",
            "successMessage": "Yes! Gigantic is the biggest!"
        },
        # Q5: Adjective ordering (application)
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "Put these in order from smallest to biggest.",
            "passage": "Tiny is smallest. Big is larger. Gigantic is the biggest.",
            "comprehensionHint": "Think about the size order.",
            "answers": [
                {"name": "tiny, big, gigantic", "icon": "📏"},
                {"name": "gigantic, big, tiny", "icon": "📐"},
                {"name": "big, tiny, gigantic", "icon": "📊"}
            ],
            "correctAnswerName": "tiny, big, gigantic",
            "successMessage": "Perfect! You ordered the words by size."
        }
    ]

    return station


def fix_v3_real_life_words(station):
    """
    Fix V3 to teach strategy with multiple words (not just cozy).
    """

    # Add more words to preview
    station['previewWords'].extend([
        {
            "word": "curious",
            "icon": "🤔",
            "isSightWord": False,
            "phonicsNote": "cu-ri-ous"
        }
    ])

    station['sightWords'].extend(["curious", "wants", "know"])

    # Add pages for second word to show transferability
    station['pages'].extend([
        {
            "type": "read",
            "image": "🤔❓",
            "sentence": "Curious means you want to know about things.",
            "targetWords": ["Curious", "want", "know", "things"],
            "sightWordFocus": "about",
            "readingTip": "Learn what the word means first.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Child looking at something with wonder."
            }
        },
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "What does curious mean?",
            "passage": "Curious means you want to know about things.",
            "comprehensionHint": "Read the sentence. It tells the meaning.",
            "answers": [
                {"name": "Want to know", "icon": "❓"},
                {"name": "Want to sleep", "icon": "😴"},
                {"name": "Want to run", "icon": "🏃"}
            ],
            "correctAnswerName": "Want to know",
            "successMessage": "Yes! Curious means want to know."
        },
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "Which shows being curious?",
            "passage": "Curious means you want to know about things.",
            "comprehensionHint": "Think about what curious people do.",
            "answers": [
                {"name": "Asking questions", "icon": "❓"},
                {"name": "Sleeping all day", "icon": "😴"},
                {"name": "Running away", "icon": "🏃"}
            ],
            "correctAnswerName": "Asking questions",
            "successMessage": "Yes! Curious people ask questions."
        }
    ])

    return station


def fix_v5_use_new_words(station):
    """
    Fix V5 to demonstrate word use strategy with multiple words.
    """

    # Add more words
    station['previewWords'].extend([
        {
            "word": "brave",
            "icon": "🦁",
            "isSightWord": False,
            "phonicsNote": "brave"
        }
    ])

    station['sightWords'].extend(["brave", "not", "afraid"])

    # Add pages for second word
    station['pages'].extend([
        {
            "type": "read",
            "image": "🦁💪",
            "sentence": "Brave means you are not afraid.",
            "targetWords": ["Brave", "not", "afraid"],
            "sightWordFocus": "are",
            "readingTip": "Learn the meaning first.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Lion standing tall, confident."
            }
        },
        {
            "type": "read",
            "image": "🧒🐕",
            "sentence": "The brave kid helps the lost dog.",
            "targetWords": ["brave", "kid", "helps", "lost", "dog"],
            "sightWordFocus": "the",
            "readingTip": "Use the new word in a sentence.",
            "ui": {
                "scene": "explore",
                "backgroundImageSuggested": True,
                "imagePrompt": "Child helping scared dog."
            }
        },
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "What does brave mean?",
            "passage": "Brave means you are not afraid.",
            "comprehensionHint": "Read the sentence. It tells the meaning.",
            "answers": [
                {"name": "Not afraid", "icon": "💪"},
                {"name": "Very scared", "icon": "😱"},
                {"name": "Very tired", "icon": "😴"}
            ],
            "correctAnswerName": "Not afraid",
            "successMessage": "Yes! Brave means not afraid."
        },
        {
            "type": "question",
            "questionType": "sightWord",
            "questionMode": "multipleChoice",
            "question": "Which sentence uses brave correctly?",
            "passage": "The brave kid helps the lost dog.",
            "comprehensionHint": "Think about what brave people do.",
            "answers": [
                {"name": "The brave kid helps the dog", "icon": "🐕"},
                {"name": "The brave kid runs away", "icon": "🏃"},
                {"name": "The brave kid is sleeping", "icon": "😴"}
            ],
            "correctAnswerName": "The brave kid helps the dog",
            "successMessage": "Yes! That shows being brave."
        }
    ])

    return station


def main():
    # Read the file
    input_file = Path(__file__).resolve().parent / "content-pack.v1.json"

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Fix each station
    print("Fixing V1 - Context and Word Parts...")
    data['stations']['l_v1_context_word_parts'] = fix_v1_context_word_parts(
        data['stations']['l_v1_context_word_parts']
    )

    print("Fixing V3 - Real-Life Word Use...")
    data['stations']['l_v3_real_life_word_use'] = fix_v3_real_life_words(
        data['stations']['l_v3_real_life_word_use']
    )

    print("Fixing V4 - Shades of Meaning...")
    data['stations']['l_v4_shades_of_meaning'] = fix_v4_shades_of_meaning(
        data['stations']['l_v4_shades_of_meaning']
    )

    print("Fixing V5 - Use New Words...")
    data['stations']['l_v5_use_new_words'] = fix_v5_use_new_words(
        data['stations']['l_v5_use_new_words']
    )

    # Write back
    with open(input_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("\n✅ All vocabulary stations fixed!")
    print("\nChanges made:")
    print("- V1: Added explicit prefix/suffix teaching, improved context clues")
    print("- V3: Added second word (curious) to demonstrate strategy")
    print("- V4: Added adjective shades (was missing L.1.5.E)")
    print("- V5: Added second word (brave) to demonstrate strategy")
    return 0


if __name__ == '__main__':
    sys.exit(main())
