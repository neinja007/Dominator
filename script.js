"use strict";
/*
  stage 0: Tutorial & Disclaimers
  stage 1: Game
    .0: Settings
    .1: Transfer & Attack
    .2: Distribute
    .3: Watch
  stage 2: Results & Stats
*/

window.addEventListener("resize", () => {
  setup();
});

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

document
  .getElementsByTagName("body")[0]
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      mousePressed(undefined, true);
    }
  });

let stage = "0-0";
let mapSize = "S";
let opponents = 1;
let difficulty = "STUPID";
let active = ["", ""];
let maxPoints = 9;
let simulation = false;
let rounds = 0;

let playerdata = {
  0: {
    power: 0,
  },
  1: {
    power: 0,
  },
  2: {
    power: 0,
  },
  3: {
    power: 0,
  },
};

async function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

const COLORS = {
  n: [0, 0, 0],
  0: [255, 255, 0],
  1: [0, 255, 0],
  2: [0, 0, 255],
  3: [255, 0, 0],
};

const MAP_SIZES = {
  S: "10x15",
  M: "14x21",
  L: "20x30",
};

const MAP_STATE = {};

function writeText(content, row = 2, col = 0, color = "#fff") {
  fill(color);
  text(
    content,
    (innerWidth / 20) * (col + 0.25),
    (innerHeight / 10) * (row + 0.5),
    innerWidth - 50
  );
  fill("#fff");
}

function startingPosition() {
  let len = mapSize === "S" ? 10 : mapSize === "M" ? 14 : 20;
  MAP_STATE[0][0] = "0-2";
  MAP_STATE[len - 1][0] = "1-2";
  if (opponents > 1) MAP_STATE[0][len * 1.5 - 1] = "2-2";
  if (opponents > 2) MAP_STATE[len - 1][len * 1.5 - 1] = "3-2";
}

const reps = {
  STUPID: 1,
  SMART: 2,
  EINSTEIN: 3,
  GOD: 30,
};

const DISPLAY = {
  TUTORIALS: {
    0: () => {
      writeText("Hello!", 0, undefined, "#0f0");
      writeText("Welcome to the DOMINATOR where you have to DOMINATE others!");
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
    1: () => {
      writeText("DISCLAIMER", 0, undefined, "#f00");
      writeText(
        "This window automatically resizes to your height & width. If they don't match, reload the tab!"
      );
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
    2: () => {
      writeText("Well then...", 0, undefined, "#aaa");
      writeText(
        "You'll quickly get the hang of the game, so I'll just briefly summarize it for you... gimme a min."
      );
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
    3: () => {
      writeText("This is how you play:", 0, undefined, "#f2f");
      writeText(
        "Select a cell with a power of more than 1. Then, either attack or transfer to any adjacent cell. This also works diagonally."
      );
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
    4: () => {
      writeText("Distribution:", 0, undefined, "#22f");
      writeText(
        "At the end of every round, you can distribute power. For every cell you have, you get to distribute 1 power."
      );
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
    5: () => {
      writeText("Winning:", 0, undefined, "#0ff");
      writeText(
        "You win when you manage to take away the enemies power. You must capture all of his cells in order to do so. But before we jump right in, let's discuss the settings!"
      );
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
    6: () => {
      writeText("The Game:", 0, undefined, "#fa0");
      writeText(
        "You can specify how many enemies you would like to DOMINATE and how hard it will be to dominate them. The map size is also adjustible."
      );
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
    7: () => {
      writeText("This sounds very wrong:", 0, undefined, "#0af");
      writeText(
        "HAPPY DOMINATION!\n\nYou'll be greeted with the game settings on the very next clickerino."
      );
      writeText("[Click anywhere continue]", 8, undefined, "#777");
    },
  },
  SETTINGS: () => {
    writeText(
      "Game Settings (To change a setting, simply give it a lil click!):",
      0,
      0.5
    );
    writeText(`Map Size: ${mapSize} (${MAP_SIZES[mapSize]})`, 1, 0.5, "#aaa");
    writeText(`Opponents: ${opponents}`, 2, 0.5, "#aaa");
    writeText(
      `Opponent Intelligence: ${difficulty.toUpperCase()}`,
      3,
      0.5,
      "#aaa"
    );
    writeText(`Max Cell Power: ${maxPoints}`, 4, 0.5, "#aaa");
    writeText(
      `Simulation? (You will spectate): ${simulation ? "Yes" : "No"}`,
      5,
      0.5,
      "#aaa"
    );
    textAlign(CENTER);
    textSize(Math.min(innerHeight / 10, innerWidth / 20));
    writeText(`click here to DOMINATE!`, 6, undefined, "#f00");
    textSize(Math.min(innerHeight / 15, innerWidth / 30));
  },
  DRAW: () => {
    textSize(Math.min(innerHeight / 30, innerWidth / 60));
    let len = mapSize === "S" ? 10 : mapSize === "M" ? 14 : 20;
    let cellLen =
      Math.min(innerHeight / len, innerWidth / (len * 2)) -
      innerWidth / 100 / len;
    for (let row = 0; row < len; row++) {
      for (let col = 0; col < len * 1.5; col++) {
        let disable = true
        for (let i = 0; i < 9; i++) {
          try {
            if (MAP_STATE[row - (i % 3 - 1)][col - ((i-i % 3) / 3 - 1)].split("-")[0] !== "0") {
              disable = false
            }
          } catch { continue }
        }
        let alpha = !disable ? parseInt(
          (255 / Math.min(maxPoints, 20)) * MAP_STATE[row][col].split("-")[1]
        ) : 255 / Math.min(maxPoints, 20)
        fill(
          ...COLORS[MAP_STATE[row][col][0]],
          alpha
        );
        if (active[0] === row && active[1] === col) {
          stroke("#0f0");
          strokeWeight(4);
        } else {
          stroke("#fff");
          strokeWeight(0.5);
        }
        rect(
          innerWidth / 200 + col * cellLen,
          innerWidth / 200 + row * cellLen,
          cellLen,
          cellLen
        );
        noStroke();
        if (MAP_STATE[row][col].split("-")[1] < 8) {
          fill("#fff");
        } else {
          fill("#000");
        }
        if (disable) {
          fill("#fff")
        }
        textAlign(CENTER);
        strokeWeight(innerHeight / 300);
        if (MAP_STATE[row][col].split("-")[1] !== "0") {
          text(
            MAP_STATE[row][col].split("-")[1],
            innerWidth / 200 + (col + 0.5) * cellLen,
            innerWidth / 200 + (row + 0.65) * cellLen
          );
          fill(
            ...COLORS[MAP_STATE[row][col][0]],
            127 - parseInt(MAP_STATE[row][col].split("-")[1]) * 14
          );
          text(
            MAP_STATE[row][col].split("-")[1],
            innerWidth / 200 + (col + 0.5) * cellLen,
            innerWidth / 200 + (row + 0.65) * cellLen
          );
        }
      }
    }
    noFill();
    rect(
      innerWidth / 200,
      innerWidth / 200,
      cellLen * len * 1.5,
      cellLen * len
    );
  },
  DESCRIPTION: () => {
    textAlign(LEFT);
    textFont("bahnschrift");
    noStroke();
    fill("#fff");
    textSize(Math.min(innerHeight / 20, innerWidth / 40));
    text(
      `-${stage[2]
        .replace("1", "TRANSFER")
        .replace("2", "DISTRIBUTE")
        .replace("3", "WATCH")}-`,
      (innerWidth / 4) * 3 + innerWidth / 200,
      (innerHeight / 15) * 1.5
    );
    textSize(Math.min(innerHeight / 30, innerWidth / 60));
    let content;
    if (stage[2] === "1") {
      content =
        "Select a cell with power greater than one and use it to transfer or attack!\n\nYou are YELLOW (top left starting position). Click on your cell and on another adjacent one you want to move to.";
    } else if (stage[2] === "2") {
      content = `Your transfer turn has ended. You must now distribute the power (${playerdata[0].power}) you have gained.\n\nIf you don't, it will be randomly distributed amongst your other cells when you click 'continue'.`;
    } else if (stage[2] === "3") {
      content = `Watch the game move. Who will win? We never know...`;
    }
    text(
      content,
      (innerWidth / 4) * 3,
      (innerHeight / 15) * 2,
      (innerWidth / 4) * 1
    );
  },
  ACTIONS: () => {
    noFill();
    stroke("#fff");
    rect(
      (innerWidth / 4) * 3,
      (innerHeight / 15) * 12.2,
      innerWidth / 4 - innerWidth / 100,
      innerHeight / 15
    );
    fill("#fff");
    noStroke();
    textAlign(CENTER);
    textSize(Math.min(innerHeight / 15, innerWidth / 30));
    text(
      "CONTINUE",
      (innerWidth / 4) * 3.5 - innerWidth / 100,
      (innerHeight / 15) * 13
    );
  },
  DONE: () => {
    textSize(Math.min(innerHeight / 5, innerWidth / 10));
    textAlign(CENTER);
    writeText(
      stage === "2-0"
        ? "Good Played."
        : stage === "2-2"
          ? "Not Played."
          : "Bad Played."
    );
    textSize(Math.min(innerHeight / 15, innerWidth / 30));
    let content;
    if (stage === "2-1") {
      content =
        "You're dogwater. Imagine loosing to idiot bots that have 0 brain cells.";
    } else if (stage === "2-0") {
      content =
        "EZ W. These bots must be improved because your brain is too large";
    } else if (stage === "2-2") {
      content =
        "Wow. You have the time to watch a game you don't even play yourself.";
    }
    writeText(content, 5);
  },
  STATS: () => {
    textSize(Math.min(innerHeight / 30, innerWidth / 60));
    textAlign(LEFT);
    text(
      "Round: " + (rounds + 1),
      (innerWidth / 4) * 3,
      (innerHeight / 15) * 8,
      (innerWidth / 4) * 1
    );

    let opponentMass = {};
    let opponentCount = {};

    for (let row of Object.keys(MAP_STATE)) {
      for (let cell of Object.keys(MAP_STATE[row])) {
        if (MAP_STATE[row][cell].split("-")[0] === "n") continue;
        if (
          Object.keys(opponentMass).includes(MAP_STATE[row][cell].split("-")[0])
        ) {
          opponentMass[MAP_STATE[row][cell].split("-")[0]] += parseInt(
            MAP_STATE[row][cell].split("-")[1]
          );
          opponentCount[MAP_STATE[row][cell].split("-")[0]]++;
        } else {
          opponentMass[MAP_STATE[row][cell].split("-")[0]] = parseInt(
            MAP_STATE[row][cell].split("-")[1]
          );
          opponentCount[MAP_STATE[row][cell].split("-")[0]] = 1;
        }
      }
    }
    for (let i of Object.keys(opponentMass)) {
      noStroke();
      fill(255, 255, 255, 255);
      let content =
        "Power: " +
        opponentMass[i] +
        " on " +
        opponentCount[i] +
        " (+ " +
        parseInt(playerdata[i].power) +
        ")";
      text(
        content,
        (innerWidth / 4) * 3,
        (innerHeight / 15) * (9 + parseInt(i) * 0.75),
        (innerWidth / 4) * 1
      );
      fill(...COLORS[i], 127);
      text(
        content,
        (innerWidth / 4) * 3,
        (innerHeight / 15) * (9 + parseInt(i) * 0.75),
        (innerWidth / 4) * 1
      );
    }
  },
};

function setup() {
  createCanvas(innerWidth, innerHeight);
  background("#000");
  textFont("bahnschrift");
  fill("#fff");
  noStroke();
  if (stage[0] === "0") {
    textAlign(CENTER);
    textSize(Math.min(innerHeight / 10, innerWidth / 20));
  } else {
    textAlign(LEFT);
    textSize(Math.min(innerHeight / 15, innerWidth / 30));
  }
}

function draw() {
  background("#000");
  if (stage[0] === "0") {
    DISPLAY.TUTORIALS[stage[2]]();
  } else if (stage === "1-0") {
    textAlign(LEFT);
    textSize(Math.min(innerHeight / 15, innerWidth / 30));
    DISPLAY.SETTINGS();
  } else if (stage === "1-1" || stage === "1-2" || stage === "1-3") {
    DISPLAY.DRAW();
    DISPLAY.DESCRIPTION();
    DISPLAY.ACTIONS();
    DISPLAY.STATS();
  } else if (stage[0] === "2") {
    DISPLAY.DONE();
  }
  if (stage[0] === "1" && stage !== "1-0") {
    testWin();
  }
}

function testWin() {
  let won = true;
  let lost = true;
  for (let row of Object.keys(MAP_STATE)) {
    for (let cell of Object.keys(MAP_STATE[row])) {
      if (
        MAP_STATE[row][cell].split("-")[0] === "1" ||
        MAP_STATE[row][cell].split("-")[0] === "2" ||
        MAP_STATE[row][cell].split("-")[0] === "3"
      ) {
        won = false;
      } else if (MAP_STATE[row][cell].split("-")[0] === "0") {
        lost = false;
      }
    }
  }
  if (simulation && (won || lost)) {
    stage = "2-2";
  } else if (won) {
    stage = "2-0";
  } else if (lost) {
    stage = "2-1";
  }
}

async function mousePressed(a, fromkey = false) {
  if (mouseX === 0 && mouseY === 0) return;
  if (stage[0] === "0") {
    stage = "0-" + parseInt(parseInt(stage[2]) + 1).toString();
    if (stage[2] === Object.keys(DISPLAY.TUTORIALS).length.toString()) {
      stage = "1-0";
    }
  } else if (stage[0] === "1") {
    if (!fromkey) {
      var len = mapSize === "S" ? 10 : mapSize === "M" ? 14 : 20;
      var cellLen =
        Math.min(innerHeight / len, innerWidth / (len * 2)) -
        innerWidth / 100 / len;

      var col = Math.round((mouseX - (mouseX % cellLen)) / cellLen);
      var row = Math.round((mouseY - (mouseY % cellLen)) / cellLen);

      var selected = active;

      if (col < len * 1.5 && row < len) {
        selected = [row, col];
        if (stage === "1-1") {
          if (active[0] === selected[0] && active[1] === selected[1]) {
            active = ["", ""];
            return;
          }
          if (active[0] === "") active = selected;
        } else if (stage === "1-2") {
          active = [...selected];
        }
      }
    }

    if (
      (mouseX > (innerWidth / 4) * 3 &&
        mouseX < innerWidth &&
        mouseY > (innerHeight / 15) * 12.2 &&
        mouseY < (innerHeight / 15) * 13.2) ||
      (fromkey && stage !== "1-0")
    ) {
      stage = stage === "1-1" ? "1-2" : "1-3";
      if (simulation) stage = "1-3";
      if (stage === "1-2") {
        for (let row of Object.keys(MAP_STATE)) {
          for (let cell of Object.keys(MAP_STATE[row])) {
            if (MAP_STATE[row][cell].split("-")[0] === "0")
              playerdata[0].power++;
          }
        }
      }
      if (stage === "1-3") {
        if (playerdata[0].power > 0) {
          start_dist: for (let minnum = 1; minnum < maxPoints; minnum++) {
            for (let row of Object.keys(MAP_STATE)) {
              for (let cell of Object.keys(MAP_STATE[row])) {
                if (playerdata[0].power <= 0) break start_dist;
                if (
                  MAP_STATE[row][cell].split("-")[0] === "0" &&
                  MAP_STATE[row][cell].split("-")[1] === minnum.toString()
                ) {
                  MAP_STATE[row][cell] =
                    "0-" +
                    (
                      parseInt(MAP_STATE[row][cell].split("-")[1]) + 1
                    ).toString();
                  playerdata[0].power--;
                }
              }
            }
          }
        }
        for (let opponent of simulation
          ? ["0", "1", "2", "3"]
          : ["1", "2", "3"]) {
          for (let i = 0; i < reps[difficulty]; i++) {
            let rows =
              Math.random() > 0.5
                ? Object.keys(MAP_STATE).reverse()
                : Object.keys(MAP_STATE);
            for (let row of rows) {
              let cols =
                Math.random() > 0.5
                  ? Object.keys(MAP_STATE[row]).reverse()
                  : Object.keys(MAP_STATE[row]);
              for (let col of cols) {
                if (
                  MAP_STATE[row][col].split("-")[0] !== "n" &&
                  (MAP_STATE[row][col].split("-")[0] !== "0" || simulation)
                ) {
                  let opponentActive = [row, col];
                  let rs, rc, cs, cc;
                  let index = Math.floor(Math.random() * 4);
                  if (index === 0) {
                    rs = -1;
                    rc = 1;
                    cs = 1;
                    cc = -1;
                  } else if (index === 1) {
                    rs = 1;
                    rc = -1;
                    cs = -1;
                    cc = 1;
                  } else if (index === 2) {
                    rs = -1;
                    rc = 1;
                    cs = -1;
                    cc = 1;
                  } else if (index === 3) {
                    rs = 1;
                    rc = -1;
                    cs = 1;
                    cc = -1;
                  }
                  for (
                    let rowChange = rs;
                    rowChange !== rc;
                    rowChange = rowChange + rc
                  ) {
                    for (
                      let colChange = cs;
                      colChange !== cc;
                      colChange = colChange + cc
                    ) {
                      if (!(colChange === 0 && rowChange === 0)) {
                        let opponentSelected = [
                          parseInt(row) + rowChange,
                          parseInt(col) + colChange,
                        ];
                        try {
                          if (
                            MAP_STATE[opponentActive[0]][
                              opponentActive[1]
                            ].split("-")[0] === opponent &&
                            parseInt(
                              MAP_STATE[opponentActive[0]][
                                opponentActive[1]
                              ].split("-")[1]
                            ) > 1
                          ) {
                            if (
                              opponentSelected[0] <=
                              parseInt(opponentActive[0]) + 1 &&
                              opponentSelected[0] >=
                              parseInt(opponentActive[0]) - 1 &&
                              opponentSelected[1] <=
                              parseInt(opponentActive[1]) + 1 &&
                              opponentSelected[1] >=
                              parseInt(opponentActive[1]) - 1
                            ) {
                              if (
                                MAP_STATE[opponentSelected[0]][
                                  opponentSelected[1]
                                ].split("-")[0] === "n" &&
                                parseInt(
                                  MAP_STATE[opponentActive[0]][
                                    opponentActive[1]
                                  ].split("-")[1]
                                ) > 1
                              ) {
                                MAP_STATE[opponentSelected[0]][
                                  opponentSelected[1]
                                ] =
                                  opponent +
                                  "-" +
                                  (
                                    parseInt(
                                      MAP_STATE[opponentActive[0]][
                                        opponentActive[1]
                                      ].split("-")[1]
                                    ) - 1
                                  ).toString();
                                MAP_STATE[opponentActive[0]][
                                  opponentActive[1]
                                ] = opponent + "-1";
                              } else if (
                                parseInt(
                                  MAP_STATE[opponentActive[0]][
                                    opponentActive[1]
                                  ].split("-")[1]
                                ) > 1 &&
                                !(
                                  MAP_STATE[opponentSelected[0]][
                                    opponentSelected[1]
                                  ].split("-")[0] === opponent
                                )
                              ) {
                                let power = parseInt(
                                  MAP_STATE[opponentActive[0]][
                                    opponentActive[1]
                                  ].split("-")[1]
                                );
                                if (
                                  parseInt(
                                    MAP_STATE[opponentSelected[0]][
                                      opponentSelected[1]
                                    ].split("-")[1]
                                  ) > power
                                ) {
                                  MAP_STATE[opponentActive[0]][
                                    opponentActive[1]
                                  ] = opponent + "-1";
                                  MAP_STATE[opponentSelected[0]][
                                    opponentSelected[1]
                                  ] =
                                    parseInt(
                                      MAP_STATE[opponentSelected[0]][
                                        opponentSelected[1]
                                      ].split("-")[0]
                                    ).toString() +
                                    "-" +
                                    parseInt(
                                      parseInt(
                                        MAP_STATE[opponentSelected[0]][
                                          opponentSelected[1]
                                        ].split("-")[1]
                                      ) - parseInt(power)
                                    ).toString();
                                } else if (
                                  power -
                                  parseInt(
                                    MAP_STATE[opponentSelected[0]][
                                      opponentSelected[1]
                                    ].split("-")[1]
                                  ) >
                                  0
                                ) {
                                  MAP_STATE[opponentActive[0]][
                                    opponentActive[1]
                                  ] = opponent + "-1";
                                  MAP_STATE[opponentSelected[0]][
                                    opponentSelected[1]
                                  ] =
                                    opponent +
                                    "-" +
                                    (
                                      power -
                                      parseInt(
                                        MAP_STATE[opponentSelected[0]][
                                          opponentSelected[1]
                                        ].split("-")[1]
                                      )
                                    ).toString();
                                } else {
                                  MAP_STATE[opponentActive[0]][
                                    opponentActive[1]
                                  ] = opponent + "-1";
                                  MAP_STATE[opponentSelected[0]][
                                    opponentSelected[1]
                                  ] = "n-0";
                                }
                              }
                            }
                          }
                        } catch {
                          continue;
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          for (let row of Object.keys(MAP_STATE)) {
            for (let cell of Object.keys(MAP_STATE[row])) {
              if (MAP_STATE[row][cell].split("-")[0] === opponent) {
                playerdata[opponent].power++;
              }
            }
          }
          let recurrance = false;
          while (playerdata[opponent].power > 0 && recurrance === false) {
            recurrance = true;
            if (difficulty === "STUPID") {
              let rows =
                Math.random() > 0.5
                  ? Object.keys(MAP_STATE).reverse()
                  : Object.keys(MAP_STATE);
              for (let row of rows) {
                let cols =
                  Math.random() > 0.5
                    ? Object.keys(MAP_STATE[row]).reverse()
                    : Object.keys(MAP_STATE[row]);
                for (let col of cols) {
                  let opponentActive = [row, col];
                  if (MAP_STATE[row][col].split("-")[0] === opponent) {
                    if (
                      MAP_STATE[opponentActive[0]][opponentActive[1]].split(
                        "-"
                      )[0] === opponent &&
                      playerdata[opponent].power > 0 &&
                      MAP_STATE[opponentActive[0]][opponentActive[1]].split(
                        "-"
                      )[1] < maxPoints
                    ) {
                      MAP_STATE[opponentActive[0]][opponentActive[1]] =
                        opponent +
                        "-" +
                        (parseInt(
                          MAP_STATE[opponentActive[0]][opponentActive[1]].split(
                            "-"
                          )[1]
                        ) +
                          1);
                      recurrance = false;
                      playerdata[opponent].power--;
                    }
                  }
                }
              }
            } else if (
              (difficulty === "EINSTEIN" && Math.random() > 0.5) ||
              difficulty === "SMART"
            ) {
              start_dist: for (let minnum = 1; minnum < maxPoints; minnum++) {
                let rows =
                  Math.random() > 0.5
                    ? Object.keys(MAP_STATE).reverse()
                    : Object.keys(MAP_STATE);
                for (let row of rows) {
                  let cols =
                    Math.random() > 0.5
                      ? Object.keys(MAP_STATE[row]).reverse()
                      : Object.keys(MAP_STATE[row]);
                  for (let col of cols) {
                    if (playerdata[opponent].power <= 0) break start_dist;
                    if (
                      MAP_STATE[row][col].split("-")[0] === opponent &&
                      MAP_STATE[row][col].split("-")[1] === minnum.toString()
                    ) {
                      MAP_STATE[row][col] =
                        opponent +
                        "-" +
                        Math.max(
                          parseInt(MAP_STATE[row][col].split("-")[1]) + 1
                        ).toString();
                      recurrance = false;
                      playerdata[opponent].power--;
                    }
                  }
                }
              }
            } else if (difficulty === "EINSTEIN" || difficulty === "GOD") {
              start_dist: for (let minnum = 1; minnum < maxPoints; minnum++) {
                let rows = Object.keys(MAP_STATE);
                rows = Math.random() > 0.5 ? rows.reverse() : rows;
                if (difficulty === "GOD" && rounds < 10) {
                  if (opponent === "1" || opponent === "3")
                    rows = rows.reverse();
                }

                let cols = [];
                for (let i = 0; i < rows.length * 1.5; i++) {
                  cols.push(i);
                }
                cols = Math.random() > 0.5 ? cols.reverse() : cols;
                if (difficulty === "GOD" && rounds < 10) {
                  if (opponent === "2" || opponent === "3")
                    cols = cols.reverse();
                }

                if (Math.random() > 0.5) {
                  for (let row of rows) {
                    for (let col of cols) {
                      if (playerdata[opponent].power <= 0) break start_dist;
                      if (
                        MAP_STATE[row][col].split("-")[0] === opponent &&
                        MAP_STATE[row][col].split("-")[1] === minnum.toString()
                      ) {
                        let Diff = Math.min(
                          playerdata[opponent].power,
                          parseInt(
                            maxPoints -
                            parseInt(MAP_STATE[row][col].split("-")[1])
                          )
                        );
                        MAP_STATE[row][col] =
                          opponent +
                          "-" +
                          (
                            parseInt(MAP_STATE[row][col].split("-")[1]) + Diff
                          ).toString();
                        recurrance = false;
                        playerdata[opponent].power -= Diff;
                      }
                    }
                  }
                } else {
                  for (let col of cols) {
                    for (let row of rows) {
                      if (playerdata[opponent].power <= 0) break start_dist;
                      if (
                        MAP_STATE[row][col].split("-")[0] === opponent &&
                        MAP_STATE[row][col].split("-")[1] === minnum.toString()
                      ) {
                        let Diff = Math.min(
                          playerdata[opponent].power,
                          parseInt(
                            maxPoints -
                            parseInt(MAP_STATE[row][col].split("-")[1])
                          )
                        );
                        MAP_STATE[row][col] =
                          opponent +
                          "-" +
                          (
                            parseInt(MAP_STATE[row][col].split("-")[1]) + Diff
                          ).toString();
                        recurrance = false;
                        playerdata[opponent].power -= Diff;
                      }
                    }
                  }
                }
              }
              playerdata[opponent].power = 0;
            }
          }
        }
        rounds++;
        stage = "1-1";
      }
      return;
    }
  }
  if (stage === "1-0") {
    if (
      mouseY > (innerHeight / 10) * 1.4 &&
      mouseY < (innerHeight / 10) * 2.1
    ) {
      mapSize = mapSize === "S" ? "M" : mapSize === "M" ? "L" : "S";
    } else if (
      mouseY > (innerHeight / 10) * 2.4 &&
      mouseY < (innerHeight / 10) * 3.1
    ) {
      opponents = opponents % 3 === 0 ? 1 : opponents + 1;
    } else if (
      mouseY > (innerHeight / 10) * 3.4 &&
      mouseY < (innerHeight / 10) * 4.1
    ) {
      difficulty =
        difficulty === "STUPID"
          ? "SMART"
          : difficulty === "SMART"
            ? "EINSTEIN"
            : difficulty === "EINSTEIN"
              ? "GOD"
              : "STUPID";
    } else if (
      mouseY > (innerHeight / 10) * 4.4 &&
      mouseY < (innerHeight / 10) * 5.1
    ) {
      maxPoints = maxPoints === 29 ? 9 : maxPoints + 10;
    } else if (
      mouseY > (innerHeight / 10) * 5.4 &&
      mouseY < (innerHeight / 10) * 6.1
    ) {
      simulation = !simulation;
    } else if (
      mouseY > (innerHeight / 10) * 6.3 &&
      mouseY < (innerHeight / 10) * 7
    ) {
      let len = mapSize === "S" ? 10 : mapSize === "M" ? 14 : 20;
      for (let i = 0; i < len; i++) {
        MAP_STATE[i] = {};
        for (let j = 0; j < len * 1.5; j++) {
          MAP_STATE[i][j] = "n-0";
        }
      }
      stage = "1-1";
      startingPosition();

      if (simulation) stage = "1-3";
    }
  } else if (stage === "1-1") {
    if (active[0] === "") return;
    if (
      MAP_STATE[active[0]][active[1]].split("-")[0] === "0" &&
      MAP_STATE[active[0]][active[1]].split("-")[1] > 1
    ) {
      if (
        selected[0] <= active[0] + 1 &&
        selected[0] >= active[0] - 1 &&
        selected[1] <= active[1] + 1 &&
        selected[1] >= active[1] - 1
      ) {
        if (
          MAP_STATE[selected[0]][selected[1]].split("-")[0] === "n" &&
          parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]) > 1
        ) {
          MAP_STATE[selected[0]][selected[1]] =
            "0-" +
            (
              parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]) - 1
            ).toString();
          MAP_STATE[active[0]][active[1]] = "0-1";
          active = [...selected];
        } else if (MAP_STATE[selected[0]][selected[1]].split("-")[0] === "0") {
          active = [...selected];
        } else if (MAP_STATE[active[0]][active[1]].split("-")[1] > 1) {
          let power = parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]);
          if (
            parseInt(MAP_STATE[selected[0]][selected[1]].split("-")[1]) >
            parseInt(power)
          ) {
            MAP_STATE[active[0]][active[1]] = "0-1";
            MAP_STATE[selected[0]][selected[1]] =
              parseInt(
                MAP_STATE[selected[0]][selected[1]].split("-")[0]
              ).toString() +
              "-" +
              parseInt(
                MAP_STATE[selected[0]][selected[1]].split("-")[1] - power
              ).toString();
          } else if (
            power -
            parseInt(MAP_STATE[selected[0]][selected[1]].split("-")[1]) >
            0
          ) {
            MAP_STATE[active[0]][active[1]] = "0-1";
            MAP_STATE[selected[0]][selected[1]] =
              "0-" +
              (power -
                parseInt(MAP_STATE[selected[0]][selected[1]].split("-")[1])).toString();
            active = [...selected];
          } else {
            MAP_STATE[active[0]][active[1]] = "0-1";
            MAP_STATE[selected[0]][selected[1]] = "n-0";
          }
        }
      } else {
        if (MAP_STATE[selected[0]][selected[1]].split("-")[0] === "n") {
          let remaining = parseInt(
            MAP_STATE[active[0]][active[1]].split("-")[1]
          );
          if (active[1] == selected[1]) {
            let start, end;
            if (parseInt(active[0]) < parseInt(selected[0])) {
              start = parseInt(active[0]);
              end = parseInt(selected[0]);
            } else {
              start = parseInt(selected[0]) + 1;
              end = parseInt(active[0]) + 1;
            }
            for (let i = start; i < end; i++) {
              if (MAP_STATE[active[1]][i].split("-")[0]!=="n" && i != start) {
                break
                // TODO: STOP THINGS
              }
              MAP_STATE[i][active[1]] = "0-1";
              remaining--;
              if (remaining === 0) break;
            }
            // TODO: STOP THINGS
            MAP_STATE[selected[0]][selected[1]] = remaining > 0 ? "0-" + remaining : "n-0";
          } else if (active[0] == selected[0]) {
            let start, end;
            if (parseInt(active[1]) < parseInt(selected[1])) {
              start = parseInt(active[1]);
              end = parseInt(selected[1]);
            } else {
              start = parseInt(selected[1]) + 1;
              end = parseInt(active[1]) + 1;
            }
            for (let i = start; i < end; i++) {
              if (MAP_STATE[active[0]][i].split("-")[0]!=="n" && i != start) {
                // TODO: STOP THINGS
                break
              }
              MAP_STATE[active[0]][i] = "0-1";
              remaining--;
              if (remaining === 0) break;
            }
            // TODO: STOP THINGS
            MAP_STATE[selected[0]][selected[1]] = remaining > 0 ? "0-" + remaining : "n-0";
          } else if (Math.abs(active[0] - selected[0]) == Math.abs(active[1] - selected[1])) {
            let xpos = false
            let ypos = false
            if (active[0] < selected[0]) xpos = true
            if (active[1] < selected[1]) ypos = true
            console.log(xpos ? selected[0] - active[0] : active[0] - selected[0])
            for (let i = 0; i < (xpos ? selected[0] - active[0] : active[0] - selected[0]); i++) {
              if (MAP_STATE[xpos ? active[0] + i : active[0] - i][ypos ? active[1] + i : active[1] - i].split("-")[0]!=="n" && i != 0) {
                // TODO: SET STOP TO TRUE
                break
              }
              MAP_STATE[xpos ? active[0] + i : active[0] - i][ypos ? active[1] + i : active[1] - i] = "0-1";
              remaining--;
              console.log("eyo")
              if (remaining === 0) break;

            }
            // TODO: STOP THINGS
            MAP_STATE[selected[0]][selected[1]] = remaining > 0 ? "0-" + remaining : "n-0";
          }
          active = [...selected];
        }
        active = [...selected];
      }
    } else {
      active = [...selected];
    }
  } else if (stage === "1-2") {
    if (playerdata[0].power > 0) {
      if (mouseButton === "left") {
        if (
          MAP_STATE[active[0]][active[1]].split("-")[0] === "0" &&
          parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]) !== maxPoints
        ) {
          MAP_STATE[active[0]][active[1]] =
            "0-" +
            (parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]) + 1);
          playerdata[0].power--;
        }
      } else if (mouseButton === "right") {
        if (
          MAP_STATE[active[0]][active[1]].split("-")[0] === "0" &&
          parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]) !== maxPoints
        ) {
          let stop = false;
          while (stop === false) {
            playerdata[0].power--;
            MAP_STATE[active[0]][active[1]] =
              "0-" +
              (parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]) + 1);
            stop =
              playerdata[0].power < 1 ||
              parseInt(MAP_STATE[active[0]][active[1]].split("-")[1]) ===
              maxPoints;
          }
        }
      }
    }
  }
}
