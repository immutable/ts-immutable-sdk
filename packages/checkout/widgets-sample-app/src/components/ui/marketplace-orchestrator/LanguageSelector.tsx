import { Box, MenuItem, OverflowPopoverMenu } from '@biom3/react';

// @ts-ignore
export const LanguageSelector = ({ onLanguageChange, language, ...args }) => {

  const handleLanguageChange = (language: string) => {
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  };

  const isSelected = (selectedLanguage: string) => {
    return selectedLanguage === language;
  }

  return (
    <Box
      sx={{
        ...args.sx,
        d: 'flex',
        gap: 'base.spacing.x4',
        flexDirection: 'column',
      }}
    >
      <OverflowPopoverMenu testId="moo">
        <MenuItem onClick={() => handleLanguageChange('en')} selected={isSelected('en')}>
          <MenuItem.Label>English</MenuItem.Label>
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('ja')} selected={isSelected('ja')}>
          <MenuItem.Label>日本語</MenuItem.Label>
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('ko')} selected={isSelected('ko')}>
          <MenuItem.Label>한국어</MenuItem.Label>
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('zh')} selected={isSelected('zh')}>
          <MenuItem.Label>中文</MenuItem.Label>
        </MenuItem>
      </OverflowPopoverMenu>
    </Box>
  )
}
