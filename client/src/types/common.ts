/**
 * 使用者狀態列舉
 */
enum IUserStatus {
  active = 1,
  inactive = 2,
}
/**
 * 使用者資訊型別
 */
export type IUserProfile = {
  user_id: string;
  email: string;
  name: string;
  avatar: string;
  status: IUserStatus;
};



/**
 * 檔案型別
 */
export type IFileAttachment = {
  bucket_id: string;
  file_path: string;
};
declare global {
  interface Window {
    userId?: string;
    token?: string;
    csrfToken?: string;
  }
}
