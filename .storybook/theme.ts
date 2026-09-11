import { create } from 'storybook/theming/create';
import { getTokenColor } from '../stories/foundations/tokens';

// Themes Storybook's own Docs page chrome (background, headings, code blocks)
// to match this prototype's dark palette, so documentation text — written
// against dark-mode tokens like text.primary — isn't rendered on a light
// background. Doesn't touch the manager/sidebar theme, only the docs preview.
export const docsTheme = create({
  base: 'dark',
  appBg: getTokenColor('background.page'),
  appContentBg: getTokenColor('background.surface'),
  appPreviewBg: getTokenColor('background.page'),
  appBorderColor: getTokenColor('border.default'),
  textColor: getTokenColor('text.primary'),
  textMutedColor: getTokenColor('text.secondary'),
  colorPrimary: getTokenColor('accent.brand.bold'),
  colorSecondary: getTokenColor('accent.brand.bold'),
  barBg: getTokenColor('background.surface'),
  barTextColor: getTokenColor('text.secondary'),
  barSelectedColor: getTokenColor('text.primary'),
  inputBg: getTokenColor('background.input'),
  inputBorder: getTokenColor('border.default'),
  inputTextColor: getTokenColor('text.primary'),
});
