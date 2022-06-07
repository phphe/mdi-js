const fs = require("fs");
const hp = require("helper-js");
const convert = require("xml-js");

const commonAttrs = {
  xmlns: "http://www.w3.org/2000/svg",
  height: "24",
  viewBox: "0 0 24 24",
  width: "24",
};

const init = async () => {
  // download from https://github.com/google/material-design-icons/archive/refs/heads/master.zip
  // about 500m
  // extract src to ./runtime. structure: ./runtime/src

  //
  const json = {
    filled: {},
    outlined: {},
    round: {},
    sharp: {},
    twotone: {},
  };
  fs.readdirSync("./runtime/src").forEach((dirName) => {
    const dir = `./runtime/src/${dirName}`;
    fs.readdirSync(dir).forEach((dirName2) => {
      const dir2 = `${dir}/${dirName2}`;
      fs.readdirSync(dir2).forEach((dirName3) => {
        const dir3 = `${dir2}/${dirName3}`;
        const file = `${dir3}/${hp.arrayLast(fs.readdirSync(dir3))}`;
        const xml = fs.readFileSync(file).toString();
        var result = JSON.parse(
          convert.xml2json(xml, { compact: true, spaces: 4 })
        );
        let name = dirName2;
        let target = json.filled;
        if (dirName3.endsWith("outlined")) {
          name += "_outlined";
          target = json.outlined;
        } else if (dirName3.endsWith("round")) {
          name += "_round";
          target = json.round;
        } else if (dirName3.endsWith("sharp")) {
          name += "_sharp";
          target = json.sharp;
        } else if (dirName3.endsWith("twotone")) {
          target = json.twotone;
          name += "_twotone";
        }
        target[name] = {
          name,
          attrs: result.svg._attributes,
          html: xml.match(/<[\s\S]+?>([\s\S]+)<\/svg>/)[1],
        };
      });
    });
  });
  //
  for (const iconType of Object.keys(json)) {
    const data = json[iconType];
    let customValues = []; // for icon
    let htmls = {};
    Object.keys(data).forEach((key) => {
      const { name, attrs, html } = data[key];
      delete attrs["enable-background"]; // beause it is deprecated from mdn https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/enable-background
      if (isCommonAttrs(attrs)) {
        data[key].attrs = "commonAttrs";
      } else {
        for (const key of Object.keys(attrs)) {
          let value = attrs[key];
          let i = customValues.indexOf(value);
          if (i === -1) {
            customValues.push(value);
            i = customValues.length - 1;
          }
          attrs[key] = `customValue${i}`;
        }
      }
      if (!htmls[html]) {
        htmls[html] = [name];
      } else {
        htmls[html].push(name);
      }
    });
    for (const key of Object.keys(htmls)) {
      if (htmls[key].length > 1) {
        for (const name of htmls[key].slice(1)) {
          data[name] = htmls[key][0];
        }
      }
    }
    //
    const sameParts = findSameParts(data); // for icon.html
    //
    let r = "";
    r += sameParts.decalareStr;
    Object.keys(data).forEach((name) => {
      let t = data[name];
      let valueString;
      if (typeof t === "string") {
        valueString = `mdi${hp.studlyCase(hp.camelCase(t))}`;
      } else {
        const { attrs, html } = t;
        valueString = JSON.stringify({ attrs, html }, null, 2);
      }
      r += `
      export const mdi${hp.studlyCase(hp.camelCase(name))}:Icon = ${valueString}
        `;
    });
    for (let i = 0; i < customValues.length; i++) {
      r =
        `const customValue${i} = ${JSON.stringify(customValues[i])}` + "\n" + r;
      r = r.replace(new RegExp(`"(customValue${i})"`, "g"), "$1");
    }
    r =
      `
    import { Icon, commonAttrs } from "./utils/common";
export { Icon } from "./utils/common";
    ` + r;
    // replace sameParts
    const samePartsReverse = sameParts.value.slice();
    samePartsReverse.reverse();
    samePartsReverse.forEach((v, i) => {
      r = r.replaceAll(
        `"html": ${strWithoutEnd(JSON.stringify(v))}`,
        `"html": samePart${samePartsReverse.length - 1 - i} + "`
      );
    });
    // replace commonAttrs
    r = r.replaceAll(`"commonAttrs"`, `commonAttrs`);
    //
    fs.writeFileSync(`src/${iconType}.ts`, r);
  }
};

init();

function findSameParts(obj) {
  let parts = {};
  let deprecated = {};
  const values = Object.values(obj);
  Object.keys(obj).forEach((name, selfIndex) => {
    if (typeof obj[name] === "string") {
      return;
    }
    const value = obj[name].html;
    let subEnd = 5;
    let lastStr;
    while (true) {
      const str = value.substring(0, subEnd);
      if (str === lastStr) {
        break;
      }
      if (!parts[str] && !deprecated[str]) {
        let indexes = [selfIndex];
        values.forEach((v, i) => {
          if (typeof v === "string") {
            return;
          }
          if (v.html.startsWith(str)) {
            indexes.push(i);
          }
        });
        parts[str] = JSON.stringify(indexes);
        if (parts[str] === parts[lastStr]) {
          delete parts[lastStr];
        }
        subEnd++;
      }
      deprecated[str] = true;
      lastStr = str;
    }
  });
  Object.keys(parts).forEach((key) => {
    if (JSON.parse(parts[key]).length < 10) {
      delete parts[key];
    } else {
      parts[key] = JSON.parse(parts[key]).length;
    }
  });
  // console.log(Object.keys(parts));

  let decalares = [];
  let lastKey;
  Object.keys(parts).forEach((key, i) => {
    if (lastKey && key.startsWith(lastKey)) {
      decalares.push(
        `samePart${i - 1} + ${JSON.stringify(key.substring(lastKey.length))}`
      );
    } else {
      decalares.push(`${JSON.stringify(key)}`);
    }
    lastKey = key;
  });
  // console.log(decalares.map((v, i) => `const samePart${i}=${v};`).join("\n"));
  return {
    value: Object.keys(parts),
    decalareStr: decalares.map((v, i) => `const samePart${i}=${v};`).join("\n"),
  };
}

function strWithoutEnd(str) {
  return str.substring(0, str.length - 1);
}

function isCommonAttrs(attrs) {
  return Object.keys(commonAttrs).every(
    (key) => commonAttrs[key] === attrs[key]
  );
}
