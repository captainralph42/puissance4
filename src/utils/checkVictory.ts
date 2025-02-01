export type Move = {
    column_played: number
    player: string
    // ... le reste
  }
  
  export function checkVictory(moves: Move[]): string | null {
    // Dimensions du plateau
    const ROWS = 6
    const COLS = 7
  
    // Construire un array 2D, initialisé à null
    const board: (string | null)[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(null)
    )
  
    // Pour chaque move dans l'ordre :
    // On "empile" le pion dans la bonne ligne
    // (i.e. la première ligne libre en partant du bas).
    moves.forEach(move => {
      const col = move.column_played
      // Trouver la première ligne libre
      for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === null) {
          board[row][col] = move.player
          break
        }
      }
    })
  
    // Vérifier 4 alignés...
    // 1) Horizontale
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const p = board[r][c]
        if (p && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) {
          return p
        }
      }
    }
  
    // 2) Verticale
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = board[r][c]
        if (p && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) {
          return p
        }
      }
    }
  
    // 3) Diagonales (top-left -> bottom-right)
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const p = board[r][c]
        if (
          p &&
          p === board[r + 1][c + 1] &&
          p === board[r + 2][c + 2] &&
          p === board[r + 3][c + 3]
        ) {
          return p
        }
      }
    }
  
    // 4) Diagonales (bottom-left -> top-right)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const p = board[r][c]
        if (
          p &&
          p === board[r - 1][c + 1] &&
          p === board[r - 2][c + 2] &&
          p === board[r - 3][c + 3]
        ) {
          return p
        }
      }
    }
  
    // Pas de gagnant
    return null
  }
  