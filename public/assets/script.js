$(document).ready(() => {
  let player = "";
  let gameRunning;
  let total = 0;
  let tail = [];
  let direction = "right";
  let speed = 250;

  $("#startModal").modal();

  $("#startModal")
    .find(".btn-primary")
    .on("click", () => {
      $("#startModal").modal("hide");
      $("#nameModal").modal();
    });

  $("#startModal")
    .find(".btn-secondary")
    .on("click", () => {
      $("#startModal").modal("hide");
      let collection = [];
      $.get("/get-highscore", (data) => {
        for (let i = 0; i < data.length; i++) {
          collection.push([data[i].player, data[i].score]);
        }

        collection = collection.sort((a, b) => {
          return b[1] - a[1];
        });

        for (let i = 1; i <= 5; i++) {
          $(`#pos${i}`).text(collection[i - 1][0]);
          $(`#score${i}`).text(collection[i - 1][1]);
        }
      });
      $("#highscoreModal").modal();
    });

  $("#nameModal").keydown((e) => {
    player = $("#nameInput").val();
    if ((e.which == 32 || e.which == 13) && player != "") {
      $("#nameModal").modal("hide");
      $("#nameInput").val("");
      runGame();
    }
  });

  function runGame() {
    gameRunning = setInterval(() => {
      gotFood();
      updateSnake();
      changeDirection();
      goDirection();
      changeSpeed();
      endGame();
    }, speed);
  }

  function changeSpeed() {
    if (total < 5) {
      speed = 250;
      clearInterval(gameRunning);
      runGame();
    } else if (total < 10) {
      speed = 200;
      clearInterval(gameRunning);
      runGame();
    } else if (total < 15) {
      speed = 150;
      clearInterval(gameRunning);
      runGame();
    } else if (total < 20) {
      speed = 100;
      clearInterval(gameRunning);
      runGame();
    } else if (total < 25) {
      speed = 75;
      clearInterval(gameRunning);
      runGame();
    } else if (total < 30) {
      speed = 50;
      clearInterval(gameRunning);
      runGame();
    }
  }

  function pauseGame() {
    clearInterval(gameRunning);
    $("#pauseModal").modal();
  }

  $("#pauseModal")
    .find(".btn-primary")
    .on("click", () => {
      $("#pauseModal").modal("hide");
      runGame();
    });

  $("#pauseModal")
    .find(".btn-danger")
    .on("click", () => {
      resetGame();
      $("#pauseModal").modal("hide");
      $("#startModal").modal();
    });

  $("#endModal")
    .find(".btn-primary")
    .on("click", () => {
      resetGame();
      $("#endModal").modal("hide");
      runGame();
    });

  $("#endModal")
    .find(".btn-danger")
    .on("click", () => {
      resetGame();
      $("#endModal").modal("hide");
      $("#startModal").modal();
    });

  function changeDirection() {
    $(document).keydown((e) => {
      switch (e.which) {
        case 37:
          if (direction != "right") {
            direction = "left";
          }
          break;
        case 38:
          if (direction != "down") {
            direction = "up";
          }
          break;
        case 39:
          if (direction != "left") {
            direction = "right";
          }
          break;
        case 40:
          if (direction != "up") {
            direction = "down";
          }
          break;
        case 32:
          pauseGame();
          break;
      }
    });
  }

  function goDirection() {
    let leftMargin = $("#snake").css("margin-left");
    let topMargin = $("#snake").css("margin-top");

    switch (direction) {
      case "right":
        $("#snake").css("margin-left", parseInt(leftMargin) + 20);
        break;
      case "left":
        $("#snake").css("margin-left", parseInt(leftMargin) - 20);
        break;
      case "up":
        $("#snake").css("margin-top", parseInt(topMargin) - 20);
        break;
      case "down":
        $("#snake").css("margin-top", parseInt(topMargin) + 20);
        break;
    }
  }

  let spawnFood = false;

  function gotFood() {
    let snake = $("#snake");
    let snakeLeft = snake.css("margin-left");
    let snakeTop = snake.css("margin-top");
    let food = $("#food");
    let foodLeft = food.css("margin-left");
    let foodTop = food.css("margin-top");
    let match = false;

    if (!spawnFood) {
      food.css({
        "margin-left": Math.floor(Math.random() * 25) * 20,
        "margin-top": Math.floor(Math.random() * 25) * 20,
        visibility: "visible",
      });
      spawnFood = true;
    }

    tail.forEach((item) => {
      if (item[0] == foodLeft && item[1] == foodTop) {
        match = true;
      }
    });

    if (match) {
      gotFood();
    }

    if (snakeLeft == foodLeft && snakeTop == foodTop) {
      food.css("visibility", "hidden");
      spawnFood = false;
      total++;
      updateTail();
    }
  }

  function updateSnake() {
    let snake = $("#snake");
    let leftMargin = parseInt(snake.css("margin-left"));
    let topMargin = parseInt(snake.css("margin-top"));

    for (let i = 0; i < tail.length - 1; i++) {
      tail[i] = tail[i + 1];
    }
    tail[total - 1] = [leftMargin, topMargin];

    for (let i = 0; i < total; i++) {
      $(`#tail${i + 1}`).css({
        "margin-left": tail[total - 1 - i][0],
        "margin-top": tail[total - 1 - i][1],
      });
    }
  }

  function updateTail() {
    let snake = $("#snake");
    let leftMargin = parseInt(snake.css("margin-left"));
    let topMargin = parseInt(snake.css("margin-top"));

    tail.push([leftMargin, topMargin]);
    $("#board").append(`<div class="snakeTail" id="tail${tail.length}"><div>`);
  }

  function endGame() {
    let leftMargin = parseInt($("#snake").css("margin-left"));
    let topMargin = parseInt($("#snake").css("margin-top"));
    if (
      leftMargin > 480 ||
      leftMargin < 0 ||
      topMargin > 480 ||
      topMargin < 0
    ) {
      clearInterval(gameRunning);
      addHighscore();
      $("#endModal").modal();
    }
    for (let i = 0; i < total; i++) {
      if (tail[i][0] == leftMargin && tail[i][1] == topMargin) {
        clearInterval(gameRunning);
        addHighscore();
        $("#endModal").modal();
      }
    }

    $("#score").text(`Score: ${total}`);
  }

  function addHighscore() {
    let newPlayer = {
      player: player,
      score: total,
    };

    $.ajax({
      method: "POST",
      url: "/new-highscore",
      data: newPlayer,
    });
  }

  function resetGame() {
    player = "";
    total = 0;
    tail = [];
    direction = "right";
    speed = 250;
    $("#snake").css({
      "margin-left": 240,
      "margin-top": 240,
    });
    $(".snakeTail").remove();
  }

  $("#highscoreModal")
    .find(".btn")
    .on("click", () => {
      $("#highscoreModal").modal("hide");
      $("#startModal").modal();
    });
});
