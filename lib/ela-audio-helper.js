/**
 * ELA Audio Helper
 *
 * Utility functions to get audio IDs for ELA content
 * Makes it easy to reference audio files by station, page, and content type
 */

/**
 * Generate audio ID for different content types
 */
const ELAAudio = {
  /**
   * Get audio ID for station announcement
   * @param {string} stationId - Station ID (e.g., 'rf_f1_print_concepts')
   */
  announcement(stationId) {
    return `${stationId}_announcement`;
  },

  /**
   * Get audio ID for a read page sentence
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  sentence(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_sentence`;
  },

  /**
   * Get audio ID for a reading tip
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  readingTip(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_readingtip`;
  },

  /**
   * Get audio ID for a question
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  question(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_question`;
  },

  /**
   * Get audio ID for a passage
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  passage(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_passage`;
  },

  /**
   * Get audio ID for a comprehension hint
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  hint(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_hint`;
  },

  /**
   * Get audio ID for an answer choice
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   * @param {number} answerIndex - Answer index (0-based)
   */
  answer(stationId, pageIndex, answerIndex) {
    return `${stationId}_page${pageIndex}_answer${answerIndex}`;
  },

  /**
   * Get audio ID for a success message
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  success(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_success`;
  },

  /**
   * Get audio ID for a menu prompt
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  menuPrompt(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_prompt`;
  },

  /**
   * Get audio ID for a menu story
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  menuStory(stationId, pageIndex) {
    return `${stationId}_page${pageIndex}_menustory`;
  },

  /**
   * Get audio ID for a menu item name
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   * @param {number} itemIndex - Menu item index (0-based)
   */
  menuItemName(stationId, pageIndex, itemIndex) {
    return `${stationId}_page${pageIndex}_item${itemIndex}_name`;
  },

  /**
   * Get audio ID for a menu item description
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   * @param {number} itemIndex - Menu item index (0-based)
   */
  menuItemDescription(stationId, pageIndex, itemIndex) {
    return `${stationId}_page${pageIndex}_item${itemIndex}_desc`;
  },

  /**
   * Get all audio IDs for a read page
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  readPage(stationId, pageIndex) {
    return [
      this.sentence(stationId, pageIndex),
      this.readingTip(stationId, pageIndex)
    ];
  },

  /**
   * Get all audio IDs for a question page (excluding answers)
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  questionPage(stationId, pageIndex) {
    return [
      this.question(stationId, pageIndex),
      this.passage(stationId, pageIndex)
    ];
  },

  /**
   * Get all audio IDs for a menu page (excluding items)
   * @param {string} stationId - Station ID
   * @param {number} pageIndex - Page index (0-based)
   */
  menuPage(stationId, pageIndex) {
    return [
      this.menuPrompt(stationId, pageIndex),
      this.menuStory(stationId, pageIndex)
    ];
  }
};

/**
 * Preload strategy helper
 * Returns prioritized list of audio IDs to preload for a station
 */
function getPreloadStrategy(stationId, currentPage = 0, lookahead = 3) {
  const audioIds = [];

  // Always include station announcement
  audioIds.push(ELAAudio.announcement(stationId));

  // Preload current page and lookahead pages
  for (let i = currentPage; i < currentPage + lookahead; i++) {
    // Add common page elements
    // Note: This is a simple strategy - you might want to load from actual station data
    audioIds.push(
      ELAAudio.sentence(stationId, i),
      ELAAudio.readingTip(stationId, i),
      ELAAudio.question(stationId, i),
      ELAAudio.passage(stationId, i),
      ELAAudio.hint(stationId, i),
      ELAAudio.success(stationId, i)
    );

    // Add answers (assuming max 4 answers per question)
    for (let j = 0; j < 4; j++) {
      audioIds.push(ELAAudio.answer(stationId, i, j));
    }
  }

  return audioIds;
}

/**
 * Get audio IDs from page data structure
 * Extracts all audio IDs needed for a given page
 */
function getAudioIdsForPage(stationId, pageIndex, pageData) {
  const audioIds = [];

  if (pageData.type === 'read') {
    if (pageData.sentence) {
      audioIds.push(ELAAudio.sentence(stationId, pageIndex));
    }
    if (pageData.readingTip) {
      audioIds.push(ELAAudio.readingTip(stationId, pageIndex));
    }
  } else if (pageData.type === 'question') {
    if (pageData.question) {
      audioIds.push(ELAAudio.question(stationId, pageIndex));
    }
    if (pageData.passage) {
      audioIds.push(ELAAudio.passage(stationId, pageIndex));
    }
    if (pageData.comprehensionHint) {
      audioIds.push(ELAAudio.hint(stationId, pageIndex));
    }
    if (pageData.answers) {
      pageData.answers.forEach((answer, idx) => {
        if (answer.name) {
          audioIds.push(ELAAudio.answer(stationId, pageIndex, idx));
        }
      });
    }
    if (pageData.successMessage) {
      audioIds.push(ELAAudio.success(stationId, pageIndex));
    }
  } else if (pageData.type === 'menu') {
    if (pageData.prompt) {
      audioIds.push(ELAAudio.menuPrompt(stationId, pageIndex));
    }
    if (pageData.menuStory) {
      audioIds.push(ELAAudio.menuStory(stationId, pageIndex));
    }
    if (pageData.items) {
      pageData.items.forEach((item, idx) => {
        if (item.name) {
          audioIds.push(ELAAudio.menuItemName(stationId, pageIndex, idx));
        }
        if (item.description) {
          audioIds.push(ELAAudio.menuItemDescription(stationId, pageIndex, idx));
        }
      });
    }
  }

  return audioIds;
}

/**
 * Get audio IDs for entire station
 */
function getAudioIdsForStation(stationId, stationData) {
  const audioIds = [];

  // Add announcement
  audioIds.push(ELAAudio.announcement(stationId));

  // Add all page audio
  if (stationData.pages) {
    stationData.pages.forEach((page, index) => {
      audioIds.push(...getAudioIdsForPage(stationId, index, page));
    });
  }

  return audioIds;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ELAAudio,
    getPreloadStrategy,
    getAudioIdsForPage,
    getAudioIdsForStation
  };
}
