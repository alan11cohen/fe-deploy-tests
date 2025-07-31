export interface LoginRequest {
  firebaseIdToken: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    uid: string;
    email: string;
    name: string | null;
    picture: string | null;
  };
}
