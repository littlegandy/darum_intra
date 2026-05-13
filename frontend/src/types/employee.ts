import { Role } from './auth';

export interface Employee {
  empno: number;
  id: string;
  name: string;
  email?: string;
  phone?: string;
  entryDate: string;
  permission: Role;
  deptno?: number;
  departmentName?: string;
  jobno?: number;
  jobgradeName?: string;
  postno?: number;
  positionName?: string;
  department?: { deptno: number; deptName: string };
  jobgrade?: { jobno: number; jobName: string };
  position?: { postno: number; postName: string };
  empState?: boolean;
  leaveDate?: string;
  intraView?: boolean;
}

export interface CreateEmployeeRequest {
  id: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  entryDate: string;
  permission: Role;
  deptno: number;
  jobno?: number;
  postno?: number;
}

export interface UpdateEmployeeRequest {
  name: string;
  password?: string;
  email?: string;
  phone?: string;
  entryDate: string;
  permission: Role;
  deptno: number;
  jobno?: number;
  postno?: number;
}
