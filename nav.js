/* ============================================================
   nav.js  —  Tab navigation between sections
   ET Concierge Agentic AI Platform
   ============================================================ */

'use strict';

/**
 * Section IDs mapped to their nav-tab index.
 * Order must match the DOM order of .nav-tab elements.
 */
const SECTION_TAB_MAP = {
  home:         0,
  chat:         1,
  architecture: 2,
  usecases:     3,
};

/**
 * Switch the visible section and highlight the correct nav tab.
 * @param {string} id  - One of the keys in SECTION_TAB_MAP
 */
function showSection(id) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
  });

  // Deactivate all tabs
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active');
  });

  // Show selected section
  const section = document.getElementById(id);
  if (section) section.classList.add('active');

  // Activate matching tab
  const tabs  = document.querySelectorAll('.nav-tab');
  const index = SECTION_TAB_MAP[id];
  if (tabs[index]) tabs[index].classList.add('active');

  // Scroll to top of new section
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
