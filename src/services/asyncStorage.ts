import AsyncStorage from '@react-native-community/async-storage';

import {
  setItemTemplate,
  setJsonTemplate,
  setBatchTemplate,
  getItemTemplate,
  getJsonTemplate,
  getBatchTemplate,
  deleteItemTemplate,
  deleteBatchTemplate
} from '@services/storage';

/**
 * Async storage implementation of setItem.
 */
export const setItem = (key: string, value: any) => setItemTemplate(AsyncStorage.setItem, key, value);

/**
 * Async storage implementation of setJson.
 */
export const setJson = (key: string, data: any) => setJsonTemplate(AsyncStorage.setItem, key, data);

/**
 * Async storage implementation of setBatch.
 */
export const setBatch = (parent: string, data: any) => setBatchTemplate(setItem, parent, data);

/**
 * Async storage implementation of getItem.
 */
export const getItem = (key: string) => getItemTemplate(AsyncStorage.getItem, key);

/**
 * Async storage implementation of getJson.
 */
export const getJson = (key: string) => getJsonTemplate(AsyncStorage.getItem, key);

/**
 * Async storage implementation of getBatch.
 */
export const getBatch = (parent: string, defaultData: any, force: boolean = false) =>
  getBatchTemplate(getItem, parent, defaultData, force);

/**
 * Async storage implementation of deleteItem.
 */
export const deleteItem = (key: string) => deleteItemTemplate(AsyncStorage.removeItem, key);

/**
 * Async storage implementation of deleteBatch.
 */
export const deleteBatch = (parent: string, data: any) => deleteBatchTemplate(deleteItem, parent, data);
