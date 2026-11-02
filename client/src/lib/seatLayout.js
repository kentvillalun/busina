// Where a seat sits on the bus map: a seat box { left, top, width, height } in canvas pixels of the 328 x 156 drawing of the bus
// seen from above, front on the right. The seats SPREAD over the whole seating area, so a bus of any size looks full of its own seats.
// Numbering: from the FRONT and from the RIGHT-hand side of the bus (the side the prototype's load cell is on).
//   a van of up to 4 seats: 2 per row, bigger seats      a bigger bus: 4 per row, up to 10 rows (40 seats)
//     back                                                 back
//     4 3     (seat 1 is front right)                      8 7 6 5
//     2 1                                                  4 3 2 1
//     front                                                front
// If the device numbers its sensors differently, change this and nothing else.
export const MAX_SEATS = 40;

// The seating area along the bus, between the rear wall and the driver's area (the door is on the front part of the right side).
const AREA = { left: 9, right: 276 };
// The two halves across the bus, on each side of the aisle.
const HALF = { right: 71, left: 8, size: 51 };
const LANES_OF_FOUR = [98, 71, 35, 8]; // top of a seat by lane, from the right-hand side

export const rowSize = (seatCount) => (seatCount <= 4 ? 2 : 4);

export const seatBox = (index, seatCount) => {
  const perRow = rowSize(seatCount);
  const rows = Math.ceil(seatCount / perRow);
  const row = Math.floor(index / perRow); // 0 = front row
  const lane = index % perRow; // 0 = right-hand side
  const slot = (AREA.right - AREA.left) / rows;

  const width = Math.min(slot - 3, perRow === 2 ? 44 : 36);
  const height = perRow === 2 ? 38 : 24;
  const left = AREA.right - (row + 0.5) * slot - width / 2;
  const top = perRow === 2 ? (lane === 0 ? HALF.right : HALF.left) + (HALF.size - height) / 2 : LANES_OF_FOUR[lane];
  return { left, top, width, height };
};
