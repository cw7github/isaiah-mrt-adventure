/**
 * ENHANCED ANIMATE JUMPS FUNCTION
 * Drop-in replacement for ManimEngine.animateJumps with number highlighting
 */

ManimEngine.animateJumpsEnhanced = function(jumper, positions, start, range) {
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

    // Highlight current and next number
    const allNums = track.querySelectorAll('.manim-nl-num');
    allNums.forEach((num, idx) => {
      const numValue = start + idx;
      if (numValue === positions[nextIndex]) {
        // Add active class to target number when frog reaches peak of jump
        setTimeout(() => {
          num.classList.add('active');
        }, 300); // Activate at peak of jump
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

// Replace the original function
ManimEngine.animateJumps = ManimEngine.animateJumpsEnhanced;
