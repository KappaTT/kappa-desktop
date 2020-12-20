import React from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

export const navigationRef = React.createRef<NavigationContainerRef>();

/**
 * Navigate to a given page without the navigation prop.
 */
export const navigate = (name: string, params: any = {}) => {
  navigationRef.current?.navigate(name, params);
};
