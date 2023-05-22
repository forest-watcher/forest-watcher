// @flow
import React from 'react';

type Props = {
  /** Data to check against */
  data: string | boolean | null | undefined,
  /** Elements that sit inside this wrapper */
  children: React.ReactNode,
  /** Component to show if data is null | undefined */
  elseComponent?: React.ReactNode
};

/**
 * Show conditional JSX based on set data parameter
 */
const OptionalWrapper = ({ data, children, elseComponent }: Props) => {
  return <>{data ? children : elseComponent || <></>}</>;
};

export default OptionalWrapper;
