import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  OAuthProvider,
  OAuthUrlResponse,
  OAuthAuthResponse,
  OAuthBindingsResponse,
} from '@shared/api.interface';

export async function getOAuthAuthorizationUrl(provider: OAuthProvider): Promise<OAuthUrlResponse> {
  const response = await axiosForBackend.get(`/api/auth/oauth/${provider}/url`);
  return response.data as OAuthUrlResponse;
}

export async function startOAuthLogin(provider: OAuthProvider): Promise<string> {
  const { authorizationUrl } = await getOAuthAuthorizationUrl(provider);
  if (!authorizationUrl) {
    throw new Error('未取得授權網址');
  }
  return authorizationUrl;
}

export interface OAuthCallbackResult {
  token: string;
  isNewUser: boolean;
  needsNicknameSetup: boolean;
  account?: OAuthAuthResponse['account'];
}

export function consumeOAuthCallback(): OAuthCallbackResult | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('oauth_token');
  if (!token) return null;

  const isNewUser = params.get('oauth_new_user') === '1';
  const needsNicknameSetup = params.get('oauth_needs_nickname') === '1';
  const error = params.get('oauth_error');

  if (error) {
    return { token: '', isNewUser: false, needsNicknameSetup: false };
  }

  const result: OAuthCallbackResult = {
    token,
    isNewUser,
    needsNicknameSetup,
  };

  const newUrl = new URL(window.location.href);
  newUrl.searchParams.delete('oauth_token');
  newUrl.searchParams.delete('oauth_new_user');
  newUrl.searchParams.delete('oauth_needs_nickname');
  newUrl.searchParams.delete('oauth_error');
  window.history.replaceState({}, '', newUrl.toString());

  return result;
}

export function getOAuthError(): string | null {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('oauth_error');
  if (!error) return null;

  const newUrl = new URL(window.location.href);
  newUrl.searchParams.delete('oauth_error');
  window.history.replaceState({}, '', newUrl.toString());

  return decodeURIComponent(error);
}

export function getOAuthLinkError(): string | null {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('oauth_link_error');
  if (!error) return null;

  const newUrl = new URL(window.location.href);
  newUrl.searchParams.delete('oauth_link_error');
  window.history.replaceState({}, '', newUrl.toString());

  return decodeURIComponent(error);
}

export function getOAuthLinkSuccess(): boolean {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('oauth_link') === '1';
  if (success) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('oauth_link');
    window.history.replaceState({}, '', newUrl.toString());
  }
  return success;
}

export async function getOAuthBindings(): Promise<OAuthBindingsResponse> {
  const { data } = await axiosForBackend.get<OAuthBindingsResponse>('/api/auth/oauth/bindings');
  return data;
}

export async function getOAuthLinkUrl(provider: OAuthProvider): Promise<string> {
  const { data } = await axiosForBackend.get<OAuthUrlResponse>(
    `/api/auth/oauth/${provider}/link`,
  );
  return data.authorizationUrl;
}

export async function unbindOAuthProvider(provider: OAuthProvider): Promise<void> {
  await axiosForBackend.delete(`/api/auth/oauth/bindings/${provider}`);
}
