import StyleDictionary from "style-dictionary";

// Turns "lineHeight" or "Heavy Border" into "line-height" / "heavy-border",
// matching the hyphenated style CSS variable names use.
function kebabCase(str) {
  return String(str)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Every token in tokens/tokens.json declares a $type (color, dimension, etc).
// A token's own path doesn't always say what kind of value it is —
// interactive.primary is a color, but nothing in that path says "color".
// So the variable name is the token's path, with its $type prefixed on
// front (skipped if the path already starts with it, e.g. color.navy.950
// stays --color-navy-950 instead of --color-color-navy-950).
const TYPE_PREFIX = {
  color: "color",
  dimension: "dimension",
  number: "number",
  fontFamily: "font-family",
  fontWeight: "font-weight",
  typography: "typography",
  string: "string",
};

StyleDictionary.registerTransform({
  name: "name/dtcg-path",
  type: "name",
  transform: (token) => {
    const pathName = token.path.map(kebabCase).join("-");
    const prefix = TYPE_PREFIX[token.$type] ?? kebabCase(token.$type ?? "");
    if (!prefix || pathName === prefix || pathName.startsWith(`${prefix}-`)) {
      return pathName;
    }
    return `${prefix}-${pathName}`;
  },
});

// tokens.json keeps font weights as the keywords Figma exports ("semi-bold"),
// which CSS can't read. Map them to the numeric weights app/fonts.css registers
// the Greed faces under, so --font-weight-* and the textStyle shorthands are
// valid CSS. An unknown keyword fails the build rather than emitting junk.
const CSS_FONT_WEIGHT = {
  regular: 400,
  "semi-bold": 600,
  bold: 700,
  heavy: 800,
};

StyleDictionary.registerTransform({
  name: "fontWeight/css-number",
  type: "value",
  filter: (token) => token.$type === "fontWeight",
  transform: (token) => {
    const value = token.$value ?? token.value;
    if (typeof value === "number") return value;
    const weight = CSS_FONT_WEIGHT[value];
    if (weight === undefined) {
      throw new Error(`Unknown font weight "${value}" at ${token.path.join(".")}`);
    }
    return weight;
  },
});

export default {
  source: ["tokens/tokens.json"],
  platforms: {
    css: {
      transforms: [
        "attribute/cti",
        "name/dtcg-path",
        "color/css",
        "size/px",
        "fontFamily/css",
        "fontWeight/css-number",
        "typography/css/shorthand",
      ],
      files: [
        {
          destination: "build/css/tokens.css",
          format: "css/variables",
        },
      ],
    },
  },
};
