import { formatBytes } from '../data';


describe('data formatting', () => {

  it('rounds bytes up correctly to nearest integer', () => {
    const formatted = formatBytes(12.7);
    expect(formatted).toEqual('13 bytes');
  });

  it('rounds bytes down correctly to nearest integer', () => {
    const formatted = formatBytes(12.3);
    expect(formatted).toEqual('12 bytes');
  });

  it('rounds half-byte up correctly to nearest integer', () => {
    const formatted = formatBytes(17.5);
    expect(formatted).toEqual('18 bytes');
  });

  it('handles non-integer values correctly', () => {
    const formatted = formatBytes(12.3*1024);
    expect(formatted).toEqual('12.3 kB');
  });

  it('converts exact integer above bytes to 1 decimal place', () => {
    const formatted = formatBytes(15*1024);
    expect(formatted).toEqual('15.0 kB');
  });

  it('handles values less than 1 correctly', () => {
    const formatted = formatBytes(0.93);
    expect(formatted).toEqual('1 bytes');
  });

  it('rounds values correctly up from larger than x.x5', () => {
    const formatted = formatBytes(1.56*1024);
    expect(formatted).toEqual('1.6 kB');
  });

  it('rounds values correctly down from less than x.x5', () => {
    const formatted = formatBytes(1.44*1024);
    expect(formatted).toEqual('1.4 kB');
  });

  it('rounds values correctly up from x.x5', () => {
    const formatted = formatBytes(1.55*1024);
    expect(formatted).toEqual('1.6 kB');
  });

  it('handles 1 kilobyte correctly', () => {
    const formatted = formatBytes(1024);
    expect(formatted).toEqual('1.0 kB');
  });

  it('handles 1 megabyte correctly', () => {
    const formatted = formatBytes(Math.pow(1024, 2));
    expect(formatted).toEqual('1.0 MB');
  });

  it('handles 1 gigabyte correctly', () => {
    const formatted = formatBytes(Math.pow(1024, 3));
    expect(formatted).toEqual('1.0 GB');
  });

  it('handles 1 terabyte correctly', () => {
    const formatted = formatBytes(Math.pow(1024, 4));
    expect(formatted).toEqual('1.0 TB');
  });
});
