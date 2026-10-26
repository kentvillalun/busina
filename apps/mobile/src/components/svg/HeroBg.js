import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SvgHeroBg = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={350}
    height={380}
    fill="none"
    {...props}
  >
    <Rect
      width={700}
      height={70}
      x={-132.69}
      y={365.447}
      fill="#fff"
      rx={35}
      transform="rotate(-34.695 -132.69 365.447)"
    />
    <Path
      stroke="#92CEFF"
      strokeDasharray="10 12"
      strokeWidth={3}
      d="M-105.399 387.298 453.692.235"
    />
    <Rect
      width={161.276}
      height={7}
      x={71.608}
      y={262.322}
      fill="#1F73BD"
      rx={3.5}
      transform="rotate(-34.695 71.608 262.322)"
    />
  </Svg>
);
export default SvgHeroBg;
