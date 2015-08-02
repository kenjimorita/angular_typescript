/// <reference path="../vendor_def/tsd.d.ts" />

declare module stanby.models.users {

  // ユーザー詳細APIのレスポンス
  export interface UserDetailResponse {
    corpUser: UserDetails;
    roles: UserRoleDetails[];
  }

  // ユーザー一覧APIのレスポンス
  export interface UserListResponse {
    users: UserOverview[];
  }

  // ユーザー概略
  export interface UserOverview {
    id: string;
    email: string;
    fullName: string;
    status: masters.UserStatus;
    title: string;
    roles: string;
    updatedBy: string;
    updatedAt: string;
  }


  // ユーザ詳細
  export interface UserDetails {
    id: string;
    email: string;
    fullName: string;
    status: UserStatus;
    versionNo:number;
    updatedBy: string;
    updatedAt: string;
    title: string;
  }

  // ロール詳細
  export interface UserRoleDetails {
    id: string;
    role: string;
    versionNo:number;
    updatedBy: string;
    updatedAt: string;
  }

  // ユーザーステータス
  export interface UserStatus {
    code: string;
    name: string;
  }

  // ユーザー概略
  export interface UserModel {
    email: string;
    currentEmail?: string;
    fullName: string;
    password?: string;
    status: string;
    title?: string;
    versionNo?: number;
    roles: string[];
    roleVersionNo?: number;
  }

  export interface UserParams extends ng.ui.IStateParamsService {
    userId: string;
    status: string;
  }

  // Emaiチェックのレスポンス
  export interface EmailValidationResponse {
    idDuplicated: boolean;
  }

  export interface CorpAccountModel {
    name: string;
    nameKana: string;
    phone: string;
    phoneType: string;
    postalCode: string;
    address: string;
    versionNo: number;
    updatedBy: string;
    updatedAt: Date;
    details: CorpAccountDetails;
  }

  export interface CorpAccountDetails {
    websiteUrl: string;
    facebookUrl: string;
    president: string;
    establishedAt: CorpAccountEstablished;
    contact: CorpAccountContact;
  }

  export interface CorpAccountEstablished {
    year: number;
    month: number;
  }

  export interface CorpAccountContact {
    name: string;
    email: string;
    phone: string;
  }
}