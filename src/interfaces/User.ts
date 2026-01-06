export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  nickname?: string;
  photoURL: string | null;
}
