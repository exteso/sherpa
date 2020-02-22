export class GeoMap {
  public obj: {};
  constructor(
    public g: string,
    public l: Array<number>,
    public u?: string,
    public t?: number
  ) {
    this.obj = {
      g: this.g,
      l: this.l,
      u: this.u,
      t: this.t
    };
  }
}
