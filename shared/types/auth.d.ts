declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'BUYER' | 'OWNER'
  }

  interface UserSession {
    user: User
  }
}

export {}