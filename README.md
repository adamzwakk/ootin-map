# OOTin-map

Generating and creating a map/tracker for use in OOT Randomizer. Inspired by `Ecksters/OoT-Interactive-Map`

- Uses maps found on https://www.vgmaps.com/Atlas/N64/

Run `node oot.js` to run the server after running `yarn install` and `gulp`.

There are some scripts in the tools folder to help you get set up generating map tiles and verifying entrances.
If you don't have map tiles, start by running `node tools/generate-map.js` to download the source maps and generate your map/map tiles.

Absolute Madness:
![Entrance Randomizer Plotted](https://i.imgur.com/fPbeNUa.png)

TODO:

- Entrance marker popups let you add the location they lead to
- Import a spoilers json to show entrance/item placements on the map
- Route Finder, give it a start/destination and it'll give the best path