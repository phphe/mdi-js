export interface Icon {
  attrs: {
    xmlns: string;
    viewBox: string;
    width: string;
    height: string;
    [key: string]: string;
  };
  html: string;
}
export const commonAttrs = {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24",
  viewBox: "0 0 24 24",
  width: "24",
};
