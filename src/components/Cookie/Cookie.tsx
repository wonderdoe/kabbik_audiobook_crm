import { cookies } from 'next/headers'


export default function CookieToken() {
    const cookieStore = cookies()
  const cookieToken = cookieStore.get('access-token')
 return cookieToken
}
