import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SvgRoadBg = (props) => (
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
  </Svg>
);
export default SvgRoadBg;
