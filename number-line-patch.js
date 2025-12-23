/**
 * ENHANCED NUMBER LINE ANIMATION PATCH
 * Add this script AFTER manim-animations.js to enhance the jump animation
 * with dynamic number highlighting
 */

(function() {
  // Store original function
  const originalAnimateJumps = ManimEngine.animateJumps;

  // Enhanced version with number highlighting
  ManimEngine.animateJumps = function(jumper, positions, start, range) {
    let currentIndex = 0;
    const track = jumper.parentElement;

    const jump = () => {
      if (currentIndex >= positions.length - 1) {
        currentIndex = 0; // Loop
      }

      const nextIndex = currentIndex + 1;
      const currentPos = ((positions[currentIndex] - start) / range) * 100;
      const nextPos = ((positions[nextIndex] - start) / range) * 100;
      const distance = nextPos - currentPos;

      // Set CSS custom properties for smooth animation
      jumper.style.setProperty('--jump-start', currentPos + '%');
      jumper.style.setProperty('--jump-end', nextPos + '%');
      jumper.style.setProperty('--jump-distance', Math.abs(distance) + '%');

      // Highlight numbers dynamically
      const allNums = track.querySelectorAll('.manim-nl-num');
      allNums.forEach((num, idx) => {
        const numValue = start + idx;
        if (numValue === positions[nextIndex]) {
          // Add active class to target number at peak of jump
          setTimeout(() => {
            num.classList.add('active');
          }, 300); // Sync with peak of arc (50% of 600ms animation)
        } else if (numValue === positions[currentIndex]) {
          // Remove active class from previous number
          num.classList.remove('active');
        }
      });

      // Add jumping class to trigger CSS animation
      jumper.classList.add('jumping');

      // Update position and remove class after animation completes
      setTimeout(() => {
        jumper.style.left = nextPos + '%';
        jumper.classList.remove('jumping');
        currentIndex = nextIndex;
      }, 600); // Match CSS animation duration
    };

    // Start jumping after initial delay
    setTimeout(() => {
      jump(); // First jump
      setInterval(jump, 1500);
    }, 1000);
  };

  console.log('Number line animation patch loaded - enhanced with dynamic number highlighting');
})();
