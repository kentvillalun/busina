import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SvgIconChevron = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    {...props}
  >
    <Path
      stroke="#9AA9B7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="m6 4 4 4-4 4"
    />
  </Svg>
);
export default SvgIconChevron;
