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
      strokeWidth={1.8}
      d="M4.2 10.2 12 3.9l7.8 6.3V19a1.1 1.1 0 0 1-1.1 1.1H15v-5.6a.9.9 0 0 0-.9-.9H9.9a.9.9 0 0 0-.9.9v5.6H5.3A1.1 1.1 0 0 1 4.2 19z"
    />
  </Svg>
);
export default SvgIconHomeOutline;
