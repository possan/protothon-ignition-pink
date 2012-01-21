"Ignition" by "Pink"
====================

This was our contribution to the protothon spotify apps hackathon, it was programmed from scratch in about 8 hours so don't expect any pulitzer-winning pieces of code in this...

Art/Idea/Presentation/Brainstorming:
@jonsander @robincedvin @joelblom

Programming/Brainstorming:
@possan

Number of infinite Justin Bieber-loops causing Spotify to crash: Several :/

Number of bugs found in Spotify: 2



The code consists of three different parts:

1. Message routing backend using node.js for passing messages between processing and spotify 

2. Spotify app backend (without design) that keeps track of scores and which side (if any) should win the next round, and starts/stops song in the player.

3. A fullscreen processing frontend which uses the camera to look for motion on either side of the room, more motion equals more score and a better chance of their (from a list of good songs) randomly picked song beeing played next. if no team interacts enough with the camera a random penalty song is played from the "bad" playlist for 15 seconds... (usually a justin bieber song)


