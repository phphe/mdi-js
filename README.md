# mdi-js

Convert Material design icons svg to js and TypeScript.

## Type

```ts
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
```

`attrs` are attributes of svg tag. `html` is the code between svg tag.

## Svg example

```svg
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10.01 21.01c0 1.1.89 1.99 1.99 1.99s1.99-.89 1.99-1.99h-3.98zm8.87-4.19V11c0-3.25-2.25-5.97-5.29-6.69v-.72C13.59 2.71 12.88 2 12 2s-1.59.71-1.59 1.59v.72C7.37 5.03 5.12 7.75 5.12 11v5.82L3 18.94V20h18v-1.06l-2.12-2.12zM16 13.01h-3v3h-2v-3H8V11h3V8h2v3h3v2.01z"/></svg>
```

## Install

```sh
npm install mdi-js
```

## Import

Material design icon has 5 styles: filled, outlined, rounded, sharp, two tone. Check: https://fonts.google.com/icons?selected=Material+Icons:arrow_downward

This library has 6 export points. A default export and 5 style exports. The default export is `filled` style.

An exported icon name is in camel case: `mdiNameStyle`. For `filled` style, suffix is omitted: `mdiName`.

```ts
// Icon is the type of all icons
import { Icon } from "mdi-js";
import { Icon } from "mdi-js/filled";
// imort a icon
import { mdiFace } from "mdi-js";
import { mdiFace } from "mdi-js/filled";
import { mdiFaceOutlined } from "mdi-js/outlined";
import { mdiFaceRound } from "mdi-js/round";
import { mdiFaceSharp } from "mdi-js/sharp";
import { mdiFaceTwotone } from "mdi-js/twotone";
```

## Usage

### Vue Example

```vue
<template>
  <svg v-bind="icon.attrs" v-html="icon.html"></svg>
</template>

<script lang="tsx">
import { mdiFace } from "mdi-svg-converted/filled";
export default {
  data() {
    return { icon: mdiFace };
  },
};
</script>
```

## Related

- [Search icon quickly in google fonts](https://fonts.google.com/icons?selected=Material+Icons:arrow_downward&icon.style=Filled)
- [MaterialDesignIcons.com](https://materialdesignicons.com/)
- [https://github.com/Templarian/MaterialDesign](https://github.com/Templarian/MaterialDesign)
