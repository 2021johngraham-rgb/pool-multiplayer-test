# The Game Room

Pool Hall, Quarterback, and Cards (Hold Em / Blackjack), with local single player and online peer rooms. All chips are play chips.

## Playing
Open index.html through GitHub Pages. Choose a player name, then a mini game. Phone layouts support portrait and landscape without stretching the game. PC layouts adapt to the browser window.

- Football: WASD movement, Shift sprint, Space hike or jump/catch, hold receiver key 1–5 and release to pass. The matching translucent receiver buttons are clickable. Q switches to the nearest defender; E tackles, F dives, G attempts a big hit. Offensive Q/E juke, F trucks with eligible ball carriers.
- Phone football: movement joystick with automatic sprint; receiver circles and Juke / Truck / defense action buttons.
- Pool: aim and draw the cue back on PC. Phone aim plus power +/- and Shoot. Call the 8-ball pocket in overhead view.
- Cards: choose Hold Em or Blackjack, then solo difficulty or an online room. Blackjack cards stay on the table; the UI shows hand totals, with Hit / Stand / Double / Split as applicable.

## Online rooms
Private rooms use five-character invite codes. Public Find Game searches rooms for the selected mini game (Cards also filters by Hold Em / Blackjack). If none is open, it creates a public room. Keep the host's browser open. Cards seats without humans use Hard bots. Room discovery uses transient PeerJS lobby advertisements, not a persistent hosted matchmaking database. Direct connections depend on browser and network compatibility; restrictive networks may require a dedicated TURN relay, which this test site does not provide.

## Music
See audio/CREDITS.txt and audio/HOLDEM-AUDIO-LICENSE.txt for attribution and licensing. No personal voice recordings are shipped; dealer lines use browser speech synthesis.

Release: cards-football-20261009.


Current release: public-ready-20261009. Public games open lobbies with player readiness. QB Career includes high school, college and the draft.
