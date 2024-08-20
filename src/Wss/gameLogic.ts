export interface GameFrameResult {
  points: { player1: number; player2: number };
  player1Offset: number;
  player2Offset: number;
  ballOffset: { x: number; y: number };
}

let points = { player1: 0, player2: 0 };
let player1Offset = 0;
let player2Offset = 0;
let ballOffset = { x: 0, y: 0 };

const upKeys = ["w", "ArrowUp"];
const downKeys = ["s", "ArrowDown"];

type MovementKey = "w" | "s" | "ArrowUp" | "ArrowDown";

export const runGameFrame = (
  player1Rect: DOMRect,
  player2Rect: DOMRect,
  ballRect: DOMRect,
  gameBoardRect: DOMRect,
  keysPressed: { player1: MovementKey; player2: MovementKey }
): GameFrameResult => {
  let ballVelocityX = 2;
  let ballVelocityY = 2;
  let ballPhi = 0;
  const maxPhi = 75;

  const offsetModifier = 2.5;
  const offsetLimit =
    50 - ((player1Rect.height / gameBoardRect.height) * 100) / 2;

  const handlePlayerMovement = (
    offsetModifier: number,
    offsetLimit: number
  ) => {
    if (upKeys.includes(keysPressed.player1) && player1Offset > -offsetLimit) {
      player1Offset = Math.max(player1Offset - offsetModifier, -offsetLimit);
    }
    if (downKeys.includes(keysPressed.player1) && player1Offset < offsetLimit) {
      player1Offset = Math.min(player1Offset + offsetModifier, offsetLimit);
    }
    if (upKeys.includes(keysPressed.player2) && player2Offset > -offsetLimit) {
      player2Offset = Math.max(player2Offset - offsetModifier, -offsetLimit);
    }
    if (downKeys.includes(keysPressed.player2) && player2Offset < offsetLimit) {
      player2Offset = Math.min(player2Offset + offsetModifier, offsetLimit);
    }
  };

  const resetGame = () => {
    player1Offset = 0;
    player2Offset = 0;
    ballOffset = { x: 0, y: 0 };
    ballPhi = 0;
  };

  const calculatePhi = (paddleRect: DOMRect): number => {
    const paddleCenter =
      paddleRect.top +
      (paddleRect.height + ballRect.height) / 2 -
      ballRect.height / 2;
    const ballCenter = ballRect.top + ballRect.height / 2;
    const distanceFromCenter = ballCenter - paddleCenter;
    return Math.abs(
      (maxPhi * distanceFromCenter) /
        (paddleRect.height / 2 + ballRect.height / 2)
    );
  };

  const checkScore = () => {
    if (ballRect.left <= gameBoardRect.left) {
      resetGame();
      points = {
        player1: points.player1,
        player2: points.player2 + 1,
      };
    } else if (ballRect.right >= gameBoardRect.right) {
      resetGame();
      points = {
        player1: points.player1 + 1,
        player2: points.player2,
      };
    }
  };

  const checkPaddleCollision = () => {
    if (
      ballRect.left <= player1Rect.right &&
      ballRect.top <= player1Rect.bottom &&
      ballRect.bottom >= player1Rect.top &&
      ballRect.left >= player1Rect.left &&
      ballRect.left >= player1Rect.right - player1Rect.width / 2
    ) {
      ballPhi = calculatePhi(player1Rect);
      ballVelocityX = -1 * ballVelocityX;
    } else if (
      ballRect.right >= player2Rect.left &&
      ballRect.top <= player2Rect.bottom &&
      ballRect.bottom >= player2Rect.top &&
      ballRect.right <= player2Rect.right &&
      ballRect.right <= player2Rect.left + player2Rect.width / 2
    ) {
      ballPhi = calculatePhi(player2Rect);
      ballVelocityX = -1 * ballVelocityX;
    }
  };

  const checkBoardCollision = () => {
    if (
      ballRect.top <= gameBoardRect.top ||
      ballRect.bottom >= gameBoardRect.bottom
    ) {
      ballVelocityY = -1 * ballVelocityY;
    }
  };

  const handleBallMovement = async () => {
    checkScore();
    checkPaddleCollision();
    checkBoardCollision();
    ballOffset = {
      x: ballOffset.x + ballVelocityX,
      y: Math.max(
        Math.min(
          ballOffset.y + ballVelocityY * Math.abs(Math.sin(ballPhi)),
          48.7
        ),
        -48.7
      ),
    };
  };

  handleBallMovement();
  handlePlayerMovement(offsetModifier, offsetLimit);

  return {
    points,
    player1Offset,
    player2Offset,
    ballOffset,
  };
};
