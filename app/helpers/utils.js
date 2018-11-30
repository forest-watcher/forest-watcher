export function hexToRgb(hex) {
  if (!hex) return '';

  let hexValue = hex;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hexValue = hex.replace(shorthandRegex, (m, r, g, b) => (
    r + r + g + g + b + b
  ));

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0,0,0'; // use as fallback for RN styles
}
