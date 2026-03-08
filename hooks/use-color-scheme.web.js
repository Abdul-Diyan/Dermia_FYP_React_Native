import { useEffect, useState } from 'react';

const APPEARANCE_PREFERENCE_KEY = 'APPEARANCE_PREFERENCE';

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState(null);
  const [hasCheckedAppearancePreference, setHasCheckedAppearancePreference] = useState(false);

  useEffect(() => {
    (async () => {
      const preference = localStorage.getItem(APPEARANCE_PREFERENCE_KEY);
      if (preference === null) {
        const mediaQueryList = matchMedia('(prefers-color-scheme: dark)');
        setColorScheme(mediaQueryList.matches ? 'dark' : 'light');
        mediaQueryList.addEventListener('change', (event) => {
          setColorScheme(event.matches ? 'dark' : 'light');
        });
      } else {
        setColorScheme(preference);
      }
      setHasCheckedAppearancePreference(true);
    })();
  }, []);

  return hasCheckedAppearancePreference ? colorScheme : null;
}

export function setColorScheme(colorScheme) {
  localStorage.setItem(APPEARANCE_PREFERENCE_KEY, colorScheme);
  setColorScheme(colorScheme);

  // Notify document about the current color scheme
  if (colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
