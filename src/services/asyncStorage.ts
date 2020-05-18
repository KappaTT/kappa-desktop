import { AsyncStorage } from 'react-native';

import { log } from '@services/logService';

export const setItem = async (key: string, value: any) => {};

export const setBatch = async (parent: string, data: any) => {};

export const getItem = async (key: string) => {};

export const getBatch = async (parent: string, defaultData: any, force: boolean = false) => {};

export const deleteItem = async (key: string) => {};

export const deleteBatch = async (parent: string, data: any) => {};
