export interface GameFrameResult {
  points: { player1: number; player2: number };
  player1Offset: number;
  player2Offset: number;
  ballOffset: { x: number; y: number };
}

const initialRect = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  height: 0,
  width: 0,
};

let ballVelocityX = 2;
let ballVelocityY = 2;
const maxPhi = 75;
const offsetModifier = 2.5;

const upKeys = ["w", "ArrowUp"];
const downKeys = ["s", "ArrowDown"];

type MovementKey = "w" | "s" | "ArrowUp" | "ArrowDown" | "";

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height: number;
  width: number;
}

export class Game {
  public initGame(player1Rect, player2Rect, ballRect, gameBoardRect) {
    this.player1Rect = player1Rect;
    this.player2Rect = player2Rect;
    this.ballRect = ballRect;
    this.gameBoardRect = gameBoardRect;
  }

  public runFrame(
    player1Key: MovementKey,
    player2Key: MovementKey
  ): GameFrameResult {
    const offsetLimit =
      50 - ((this.player1Rect.height / this.gameBoardRect.height) * 100) / 2;

    this.handleBallMovement();
    this.handlePlayerMovement(player1Key, player2Key, offsetLimit);
    this.updateRects();

    return {
      points: this.points,
      player1Offset: this.player1Offset,
      player2Offset: this.player2Offset,
      ballOffset: this.ballOffset,
    };
  }

  private points = { player1: 0, player2: 0 };
  private player1Offset = 0;
  private player2Offset = 0;
  private ballOffset = { x: 0, y: 0 };
  private ballPhi = 0;
  private player1Rect: Rect = initialRect;
  private player2Rect: Rect = initialRect;
  private ballRect: Rect = initialRect;
  private gameBoardRect: Rect = initialRect;

  private updateRects = () => {
    const ballXOffsetPx = this.calculateOffsetInPx(this.ballOffset.x, "x");
    const ballYOffsetPx = this.calculateOffsetInPx(this.ballOffset.y, "y");
    this.ballRect.left = this.ballRect.left + ballXOffsetPx;
    this.ballRect.right = this.ballRect.right + ballXOffsetPx;
    this.ballRect.top = this.ballRect.top + ballYOffsetPx;
    this.ballRect.bottom = this.ballRect.bottom + ballYOffsetPx;

    const player1OffsetPx = this.calculateOffsetInPx(this.player1Offset, "y");
    this.player1Rect.top = this.player1Rect.top + player1OffsetPx;
    this.player1Rect.bottom = this.player1Rect.bottom + player1OffsetPx;

    const player2OffsetPx = this.calculateOffsetInPx(this.player2Offset, "y");
    this.player2Rect.top = this.player2Rect.top + player2OffsetPx;
    this.player2Rect.bottom = this.player2Rect.bottom + player2OffsetPx;
  };

  private handlePlayerMovement = (
    player1Key: MovementKey,
    player2Key: MovementKey,
    offsetLimit: number
  ) => {
    if (upKeys.includes(player1Key) && this.player1Offset > -offsetLimit) {
      this.player1Offset = Math.max(
        this.player1Offset - offsetModifier,
        -offsetLimit
      );
    }
    if (downKeys.includes(player1Key) && this.player1Offset < offsetLimit) {
      this.player1Offset = Math.min(
        this.player1Offset + offsetModifier,
        offsetLimit
      );
    }
    if (upKeys.includes(player2Key) && this.player2Offset > -offsetLimit) {
      this.player2Offset = Math.max(
        this.player2Offset - offsetModifier,
        -offsetLimit
      );
    }
    if (downKeys.includes(player2Key) && this.player2Offset < offsetLimit) {
      this.player2Offset = Math.min(
        this.player2Offset + offsetModifier,
        offsetLimit
      );
    }
  };

  private handleBallMovement = async () => {
    this.checkScore();
    this.checkPaddleCollision();
    this.checkBoardCollision();
    this.ballOffset = {
      x: this.ballOffset.x + ballVelocityX,
      y: Math.max(
        Math.min(
          this.ballOffset.y + ballVelocityY * Math.abs(Math.sin(this.ballPhi)),
          48.7
        ),
        -48.7
      ),
    };
  };

  private checkScore = () => {
    if (this.ballRect.left <= this.gameBoardRect.left) {
      this.resetGame();
      this.points = {
        player1: this.points.player1,
        player2: this.points.player2 + 1,
      };
    } else if (this.ballRect.right >= this.gameBoardRect.right) {
      this.resetGame();
      this.points = {
        player1: this.points.player1 + 1,
        player2: this.points.player2,
      };
    }
  };

  private checkPaddleCollision = () => {
    if (
      this.ballRect.left <= this.player1Rect.right &&
      this.ballRect.top <= this.player1Rect.bottom &&
      this.ballRect.bottom >= this.player1Rect.top &&
      this.ballRect.left >= this.player1Rect.left &&
      this.ballRect.left >= this.player1Rect.right - this.player1Rect.width / 2
    ) {
      this.ballPhi = this.calculatePhi(this.player1Rect);
      ballVelocityX = -1 * ballVelocityX;
    } else if (
      this.ballRect.right >= this.player2Rect.left &&
      this.ballRect.top <= this.player2Rect.bottom &&
      this.ballRect.bottom >= this.player2Rect.top &&
      this.ballRect.right <= this.player2Rect.right &&
      this.ballRect.right <= this.player2Rect.left + this.player2Rect.width / 2
    ) {
      this.ballPhi = this.calculatePhi(this.player2Rect);
      ballVelocityX = -1 * ballVelocityX;
    }
  };

  private checkBoardCollision = () => {
    if (
      this.ballRect.top <= this.gameBoardRect.top ||
      this.ballRect.bottom >= this.gameBoardRect.bottom
    ) {
      ballVelocityY = -1 * ballVelocityY;
    }
  };

  private calculatePhi = (paddleRect: Rect): number => {
    const paddleCenter =
      paddleRect.top +
      (paddleRect.height + this.ballRect.height) / 2 -
      this.ballRect.height / 2;
    const ballCenter = this.ballRect.top + this.ballRect.height / 2;
    const distanceFromCenter = ballCenter - paddleCenter;
    return Math.abs(
      (maxPhi * distanceFromCenter) /
        (paddleRect.height / 2 + this.ballRect.height / 2)
    );
  };

  private calculateOffsetInPx = (offset: number, direction: "x" | "y") => {
    return (
      (offset / 100) *
      (direction === "y" ? this.gameBoardRect.height : this.gameBoardRect.width)
    );
  };

  private resetGame = () => {
    this.player1Offset = 0;
    this.player2Offset = 0;
    this.ballOffset = { x: 0, y: 0 };
    this.ballPhi = 0;
  };
}

// let points = { player1: 0, player2: 0 };
// let player1Offset = 0;
// let player2Offset = 0;
// let ballOffset = { x: 0, y: 0 };

// export const runGameFrame = (): GameFrameResult => {
//   let ballVelocityX = 2;
//   let ballVelocityY = 2;
//   const maxPhi = 75;

//   const offsetModifier = 2.5;
//   const offsetLimit =
//     50 - ((this.player1Rect.height / this.gameBoardRect.height) * 100) / 2;

//   const calculateOffsetInPx = (offset: number, direction: "x" | "y") => {
//     return (
//       (offset / 100) *
//       (direction === "y" ? this.gameBoardRect.height : this.gameBoardRect.width)
//     );
//   };

//   const handlePlayerMovement = (
//     offsetModifier: number,
//     offsetLimit: number
//   ) => {
//     if (upKeys.includes(ws1["keyPressed"]) && player1Offset > -offsetLimit) {
//       player1Offset = Math.max(player1Offset - offsetModifier, -offsetLimit);
//     }
//     if (downKeys.includes(ws1["keyPressed"]) && player1Offset < offsetLimit) {
//       player1Offset = Math.min(player1Offset + offsetModifier, offsetLimit);
//     }
//     if (upKeys.includes(ws2["keyPressed"]) && player2Offset > -offsetLimit) {
//       player2Offset = Math.max(player2Offset - offsetModifier, -offsetLimit);
//     }
//     if (downKeys.includes(ws2["keyPressed"]) && player2Offset < offsetLimit) {
//       player2Offset = Math.min(player2Offset + offsetModifier, offsetLimit);
//     }
//   };

//   const resetGame = () => {
//     player1Offset = 0;
//     player2Offset = 0;
//     ballOffset = { x: 0, y: 0 };
//     this.ballPhi = 0;
//   };

//   const calculatePhi = (paddleRect: Rect): number => {
//     const paddleCenter =
//       paddleRect.top +
//       (paddleRect.height + this.ballRect.height) / 2 -
//       this.ballRect.height / 2;
//     const ballCenter = this.ballRect.top + this.ballRect.height / 2;
//     const distanceFromCenter = ballCenter - paddleCenter;
//     return Math.abs(
//       (maxPhi * distanceFromCenter) /
//         (paddleRect.height / 2 + this.ballRect.height / 2)
//     );
//   };

//   const checkScore = () => {
//     if (this.ballRect.left <= this.gameBoardRect.left) {
//       resetGame();
//       points = {
//         player1: points.player1,
//         player2: points.player2 + 1,
//       };
//     } else if (this.ballRect.right >= this.gameBoardRect.right) {
//       resetGame();
//       points = {
//         player1: points.player1 + 1,
//         player2: points.player2,
//       };
//     }
//   };

//   checkPaddleCollision = () => {
//     if (
//       this.ballRect.left <= this.player1Rect.right &&
//       this.ballRect.top <= this.player1Rect.bottom &&
//       this.ballRect.bottom >= this.player1Rect.top &&
//       this.ballRect.left >= this.player1Rect.left &&
//       this.ballRect.left >= this.player1Rect.right - this.player1Rect.width / 2
//     ) {
//       this.ballPhi = calculatePhi(this.player1Rect);
//       ballVelocityX = -1 * ballVelocityX;
//     } else if (
//       this.ballRect.right >= this.player2Rect.left &&
//       this.ballRect.top <= this.player2Rect.bottom &&
//       this.ballRect.bottom >= this.player2Rect.top &&
//       this.ballRect.right <= this.player2Rect.right &&
//       this.ballRect.right <= this.player2Rect.left + this.player2Rect.width / 2
//     ) {
//       this.ballPhi = calculatePhi(this.player2Rect);
//       ballVelocityX = -1 * ballVelocityX;
//     }
//   };

//   const checkBoardCollision = () => {
//     if (
//       this.ballRect.top <= this.gameBoardRect.top ||
//       this.ballRect.bottom >= this.gameBoardRect.bottom
//     ) {
//       ballVelocityY = -1 * ballVelocityY;
//     }
//   };

//   const handleBallMovement = async () => {
//     checkScore();
//     checkPaddleCollision();
//     checkBoardCollision();
//     ballOffset = {
//       x: ballOffset.x + ballVelocityX,
//       y: Math.max(
//         Math.min(
//           ballOffset.y + ballVelocityY * Math.abs(Math.sin(this.ballPhi)),
//           48.7
//         ),
//         -48.7
//       ),
//     };
//   };

//   handleBallMovement();
//   handlePlayerMovement(offsetModifier, offsetLimit);

//   return {
//     points,
//     player1Offset,
//     player2Offset,
//     ballOffset,
//   };
// };
