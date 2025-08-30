// src/types/google-oauth.types.ts
// Type definitions for Google OAuth responses

export interface CredentialResponse {
  /** JWT credential string */
  credential?: string
  /** How the credential was selected */
  select_by?: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm' | 'btn_add_session' | 'btn_confirm_add_session'
  /** Client ID that was used */
  clientId?: string
}

export interface TokenResponse {
  /** The access token */
  access_token: string
  /** The authorization code (if using auth-code flow) */
  authuser?: string
  /** Token expiration time in seconds */
  expires_in: number
  /** Space-separated list of granted scopes */
  scope: string
  /** Type of token (usually "Bearer") */
  token_type: string
  /** Error code if request failed */
  error?: string
  /** Error description if request failed */
  error_description?: string
  /** Error URI if request failed */
  error_uri?: string
}

export interface CodeResponse {
  /** The authorization code */
  code: string
  /** Space-separated list of granted scopes */
  scope: string
  /** The state parameter passed in the request */
  state?: string
  /** Error code if request failed */
  error?: string
  /** Error description if request failed */
  error_description?: string
  /** Error URI if request failed */
  error_uri?: string
}

export interface DecodedGoogleToken {
  /** User's email address */
  email: string
  /** Whether email is verified */
  email_verified: boolean
  /** User's full name */
  name: string
  /** User's profile picture URL */
  picture: string
  /** Google user ID (subject) */
  sub: string
  /** Issued at timestamp */
  iat: number
  /** Expiration timestamp */
  exp: number
  /** Token issuer */
  iss?: string
  /** Audience (client ID) */
  aud?: string
  /** Authorized presenter */
  azp?: string
  /** Given name */
  given_name?: string
  /** Family name */
  family_name?: string
  /** Locale */
  locale?: string
}
