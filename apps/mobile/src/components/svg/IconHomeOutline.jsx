import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SvgIconHomeOutline = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 10.6 12 4l8 6.6V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"
    />
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.8 20.5v-5a1 1 0 0 1 1-1h2.4a1 1 0 0 1 1 1v5"
    />
  </Svg>
);
export default SvgIconHomeOutline;
