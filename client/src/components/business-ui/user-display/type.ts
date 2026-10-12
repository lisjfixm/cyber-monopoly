import type { AccountType } from '@lark-apaas/client-toolkit/tools/services';
import type { UserInput } from '@client/src/components/business-ui/types/user';

export interface UserWithAvatarProps {
  /**
   * 使用者資料，可以只傳 userId，元件會自動查詢 name 和 avatar
   */
  data: UserInput;
  /**
   * @default medium
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * @default tag
   */
  mode?: 'tag' | 'plain';
  className?: string;
  /**
   * @default true
   */
  showLabel?: boolean;
  /**
   * 賬戶型別，用於查詢使用者資訊
   * @default 'apaas'
   */
  accountType?: AccountType;
}
