// StreetView Golf deployment config.
// This file is public: NEVER put passwords, private signing keys or other secrets here.
window.SVGOLF_CONFIG = {
  googleMapsApiKey: 'AIzaSyCbJy7jye2NQ1bJaR8e0gpjMT6EjZtbfBc',

  // These are the courses shown in the homepage "Club Challenges" list.
  // Visitors can play them but cannot change this list; only a GitHub repo change can.
  configuredChallenges: [
    { code: 'TOMNAT100', name: 'The 100 Point Challenge', description: 'Nine questionable decisions. Points may or may not matter.' },
    { code: 'SCOTLAND9', name: 'The Scottish Open', description: 'A seeded nine-hole tour with a distinctly northern starting attitude.' },
    { code: 'WRONGTURN', name: 'Fore. Wrong Turn.', description: 'The house course. Navigation confidence strongly discouraged.' }
  ]
};
