import apiClient from './axios';
import { unwrapResponseData } from './apiResponseHelper';
import type { ApiResponse } from '../types';

/**
 * 마스터 데이터 API 타입
 */
export interface Department {
  deptno: number;
  deptName: string;
  deptRank?: number;
}

export interface Customer {
  custno: number;
  custName: string;
  darumSales?: string;
  vacation?: boolean;
  location?: string;
}

export interface Product {
  prodno: number;
  prodName: string;
  prodState?: string;
  vacation?: boolean;
}

export interface Support {
  suppno: number;
  suppname: string;
  vacation?: boolean;
}

/**
 * 마스터 데이터 API 클라이언트
 */

/**
 * 부서 목록 조회
 */
export const getDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get<ApiResponse<Department[]>>('/api/v1/master/departments');
  return unwrapResponseData(response);
};

export const getActiveDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get<ApiResponse<Department[]>>('/api/v1/master/departments/active');
  return unwrapResponseData(response);
};

/**
 * 고객사 목록 조회
 */
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get<ApiResponse<Customer[]>>('/api/v1/master/customers');
  return unwrapResponseData(response);
};

/**
 * 제품 목록 조회
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product[]>>('/api/v1/master/products');
  return unwrapResponseData(response);
};

/**
 * 지원유형 목록 조회
 */
export const getSupports = async (): Promise<Support[]> => {
  const response = await apiClient.get<ApiResponse<Support[]>>('/api/v1/master/supports');
  return unwrapResponseData(response);
};

export const createDepartment = async (payload: { deptName: string; deptRank?: number }) => {
  const response = await apiClient.post<ApiResponse<Department>>('/api/v1/master/departments', payload);
  return unwrapResponseData(response);
};

export const createCustomer = async (payload: { custName: string; darumSales?: string; vacation?: boolean; location?: string }) => {
  const response = await apiClient.post<ApiResponse<Customer>>('/api/v1/master/customers', payload);
  return unwrapResponseData(response);
};

export const createProduct = async (payload: { prodName: string; prodState?: boolean; vacation?: boolean }) => {
  const response = await apiClient.post<ApiResponse<Product>>('/api/v1/master/products', payload);
  return unwrapResponseData(response);
};

export const createSupport = async (payload: { suppname: string; vacation?: boolean }) => {
  const response = await apiClient.post<ApiResponse<Support>>('/api/v1/master/supports', payload);
  return unwrapResponseData(response);
};

export const updateDepartment = async (deptno: number, payload: { deptName: string; deptRank?: number }) => {
  const response = await apiClient.put<ApiResponse<Department>>(`/api/v1/master/departments/${deptno}`, payload);
  return unwrapResponseData(response);
};

export const deleteDepartment = async (deptno: number) => {
  await apiClient.delete(`/api/v1/master/departments/${deptno}`);
};

export const updateCustomer = async (custno: number, payload: { custName: string; darumSales?: string; vacation?: boolean; location?: string }) => {
  const response = await apiClient.put<ApiResponse<Customer>>(`/api/v1/master/customers/${custno}`, payload);
  return unwrapResponseData(response);
};

export const deleteCustomer = async (custno: number) => {
  await apiClient.delete(`/api/v1/master/customers/${custno}`);
};

export const updateProduct = async (prodno: number, payload: { prodName: string; prodState?: boolean; vacation?: boolean }) => {
  const response = await apiClient.put<ApiResponse<Product>>(`/api/v1/master/products/${prodno}`, payload);
  return unwrapResponseData(response);
};

export const deleteProduct = async (prodno: number) => {
  await apiClient.delete(`/api/v1/master/products/${prodno}`);
};

export const updateSupport = async (suppno: number, payload: { suppname: string; vacation?: boolean }) => {
  const response = await apiClient.put<ApiResponse<Support>>(`/api/v1/master/supports/${suppno}`, payload);
  return unwrapResponseData(response);
};

export const deleteSupport = async (suppno: number) => {
  await apiClient.delete(`/api/v1/master/supports/${suppno}`);
};
