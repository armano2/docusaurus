/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {useState, useCallback, useEffect} from 'react';

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import type {useThemeReturns} from '@theme/hooks/useTheme';
import {useThemeConfig} from '@docusaurus/theme-common';

const themes = {
  light: 'light',
  dark: 'dark',
} as const;

// Ensure to always return a valid theme even if input is invalid
const coerceToTheme = (theme?: string | null): 'light' | 'dark' => {
  return theme === themes.dark ? themes.dark : themes.light;
};

const getInitialTheme = (defaultMode: 'light' | 'dark' | undefined) => {
  if (!ExecutionEnvironment.canUseDOM) {
    return coerceToTheme(defaultMode);
  }
  return coerceToTheme(document.documentElement.getAttribute('data-theme'));
};

const storeTheme = (newTheme: 'light' | 'dark') => {
  try {
    localStorage.setItem('theme', coerceToTheme(newTheme));
  } catch (err) {
    console.error(err);
  }
};

const useTheme = (): useThemeReturns => {
  const {
    colorMode: {defaultMode, disableSwitch, respectPrefersColorScheme},
  } = useThemeConfig();
  const [theme, setTheme] = useState(getInitialTheme(defaultMode));

  const setLightTheme = useCallback(() => {
    setTheme(themes.light);
    storeTheme(themes.light);
  }, []);
  const setDarkTheme = useCallback(() => {
    setTheme(themes.dark);
    storeTheme(themes.dark);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', coerceToTheme(theme));
  }, [theme]);

  useEffect(() => {
    if (disableSwitch) {
      return;
    }

    try {
      const localStorageTheme = localStorage.getItem('theme');
      if (localStorageTheme !== null) {
        setTheme(coerceToTheme(localStorageTheme));
      }
    } catch (err) {
      console.error(err);
    }
  }, [setTheme]);

  useEffect(() => {
    if (disableSwitch && !respectPrefersColorScheme) {
      return;
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', ({matches}) => {
        setTheme(matches ? themes.dark : themes.light);
      });
  }, []);

  return {
    isDarkTheme: theme === themes.dark,
    setLightTheme,
    setDarkTheme,
  };
};

export default useTheme;
