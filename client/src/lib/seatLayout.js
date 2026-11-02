// Where a seat sits on the bus map. The seats are rows of 4 across the bus, numbered from the FRONT: seats[0..3] are the front
// row (seat 1 is in front), the next four are the row behind, and so on. A bus has up to 10 rows (40 seats); a smaller bus fills
// only the front rows, so a 4-seat bus has just the front row. `column` 0 is the rear-most column, `lane` 0 to 3 goes across.
// If the device numbers its sensors differently, change this and nothing else.
export const ROWS_OF = 4;
export const MAX_ROWS = 10;
export const MAX_SEATS = ROWS_OF * MAX_ROWS;

export const seatSlot = (index) => ({ column: MAX_ROWS - 1 - Math.floor(index / ROWS_OF), lane: index % ROWS_OF });
