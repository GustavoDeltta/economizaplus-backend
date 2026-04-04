export interface InterfaceGoogleAuthProvider {
  verifyToken(idToken: string): Promise<GooglePayload>;
}

export type GooglePayload = {
  sub: string;      
  email: string;
  name: string;
  picture?: string;
};