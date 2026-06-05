export interface InterfaceMailProvider {
  sendMail(to: string, subject: string, body: string): Promise<void>;
}
