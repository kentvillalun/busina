// Where a seat sits on the bus map, seen from above with the front on the right of the drawing.
// The seats are numbered from the FRONT and from the RIGHT-hand side of the bus (the side the load cell of the prototype is on):
//   a van of up to 4 seats has 2 per row           a bigger bus has 4 per row, up to 10 rows (40 seats)
//     back                                           back
//     4 3     (seat 1 is front right)                8 7 6 5
//     2 1                                            4 3 2 1
//     front                                          front
// A bus with fewer seats fills only the front rows. `column` 0 is the rear-most column; `lane` 0 is the right-hand side and
// counts toward the left. If the device numbers its sensors differently, change this and nothing else.
export const MAX_ROWS = 10;
export const MAX_SEATS = 40;

export const rowSize = (seatCount) => (seatCount <= 4 ? 2 : 4);

export const seatSlot = (index, seatCount) => {
  const perRow = rowSize(seatCount);
  return { column: MAX_ROWS - 1 - Math.floor(index / perRow), lane: index % perRow };
};
