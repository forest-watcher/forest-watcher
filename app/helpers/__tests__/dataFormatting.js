import { formatBytes } from '../data';


describe('data formatting', () => {

  it('handles non-integer values correctly', () => {
    const formatted = formatBytes(12.3);
    expect(formatted).toEqual('12.3 bytes');
  });

  it('converts integers to 1 decimal place', () => {
    const formatted = formatBytes(15);
    expect(formatted).toEqual('15.0 bytes');
  });

  it('handles values less than 1 correctly', () => {
    const formatted = formatBytes(0.93);
    expect(formatted).toEqual('0.9 bytes');
  });

  it('rounds values correctly up from larger than x.x5', () => {
    const formatted = formatBytes(0.56);
    expect(formatted).toEqual('0.6 bytes');
  });

  it('rounds values correctly down from less than x.x5', () => {
    const formatted = formatBytes(0.44);
    expect(formatted).toEqual('0.4 bytes');
  });

  it('rounds values correctly up from x.xs5', () => {
    const formatted = formatBytes(0.55);
    expect(formatted).toEqual('0.6 bytes');
  });

  it('handles 1 kilobyte correctly', () => {
    const formatted = formatBytes(1024);
    expect(formatted).toEqual('1.0 kb');
  });

  it('handles 1 megabyte correctly', () => {
    const formatted = formatBytes(Math.pow(1024, 2));
    expect(formatted).toEqual('1.0 mb');
  });

  it('handles 1 gigabyte correctly', () => {
    const formatted = formatBytes(Math.pow(1024, 3));
    expect(formatted).toEqual('1.0 gb');
  });

  it('handles 1 terabyte correctly', () => {
    const formatted = formatBytes(Math.pow(1024, 4));
    expect(formatted).toEqual('1.0 tb');
  });
});
