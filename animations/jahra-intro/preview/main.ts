import { createPlayer } from "@clayzo/webgl-player";
import doc from "../jahra-intro.json";

const canvas = document.querySelector("canvas")!;
const params = new URLSearchParams(location.search);
const still = params.has("still");
createPlayer({ canvas, document: doc as any, loop: true, resolution: "document" }).then((player) => {
  (window as any).player = player;
  if (!still) player.play();
  (window as any).ready = true;
});
