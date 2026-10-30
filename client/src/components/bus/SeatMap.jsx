// Figma S2 / S3: the bus seen from above, drawn on a 328 x 156 canvas. Every position below is the
// Figma one in pixels, turned into percentages so the map scales with its card.
const W = 328;
const H = 156;
const x = (value) => `${(value / W) * 100}%`;
const y = (value) => `${(value / H) * 100}%`;

// The 40 seats are 10 rows of 4 across the bus, numbered from the rear: seats[0..3] are the rear
// row, seats[36..39] the front one. If the device numbers its sensors differently, change this
// mapping and nothing else.
const ROWS_OF = 4;
const COLUMN_X = (column) => 9 + column * 27; // column 0 = rear
const LANE_Y = [8, 35, 71, 98]; // two lanes on each side of the aisle

const seatClass = {
  free: "border-[1.5px] border-success bg-success-tint",
  taken: "bg-uncertain",
  unknown: "border-[1.25px] border-dashed border-uncertain",
};

const Piece = ({ left, top, width, height, className = "", style, children }) => (
  <div
    className={`absolute ${className}`}
    style={{ left: x(left), top: y(top), width: width && x(width), height: height && y(height), ...style }}
  >
    {children}
  </div>
);

// `seats` is the array from the API (1 = taken, 0 = free). `unknown` draws every seat as "no reading".
const SeatMap = ({ seats, unknown = false }) => (
  <div className="relative mx-auto w-full max-w-100" style={{ aspectRatio: `${W} / ${H}` }}>
    {/* The Figma exports bleed a little past their box, so each image is a bit larger than its slot. */}
    <Piece left={0} top={0} width={W} height={134}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bus/body.svg"
        alt=""
        className="absolute max-w-none"
        style={{ left: "-0.23%", top: "-0.56%", width: "100.46%", height: "101.12%" }}
      />
    </Piece>
    <Piece left={311} top={18} width={9} height={98}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bus/windshield.svg"
        alt=""
        className="absolute max-w-none"
        style={{ left: "-5.56%", top: "-1.11%", width: "111.12%", height: "102.22%" }}
      />
    </Piece>
    <Piece left={283} top={18} width={16} height={22} className="rounded-[5px] bg-[#c9d3dc]" />
    <Piece left={298} top={23.5} width={11} height={11}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bus/steering-wheel.svg" alt="" className="absolute inset-0 size-full max-w-none" />
    </Piece>
    <Piece left={243} top={131} width={34} height={6} className="rounded-[3px] bg-primary" />

    {Array.from({ length: 40 }, (_, i) => {
      const column = Math.floor(i / ROWS_OF);
      const lane = i % ROWS_OF;
      const state = unknown ? "unknown" : seats[i] ? "taken" : "free";
      return (
        <Piece
          key={i}
          left={COLUMN_X(column)}
          top={LANE_Y[lane]}
          width={24}
          height={24}
          className={`rounded-md ${seatClass[state]}`}
        />
      );
    })}

    <span className="absolute text-[11px] font-medium text-muted" style={{ left: 0, top: y(142) }}>
      Rear
    </span>
    <span className="absolute text-[11px] font-medium text-muted" style={{ left: x(247), top: y(142) }}>
      Door
    </span>
    <span className="absolute text-[11px] font-bold text-navy" style={{ left: x(292), top: y(142) }}>
      Front ›
    </span>
  </div>
);

export default SeatMap;
