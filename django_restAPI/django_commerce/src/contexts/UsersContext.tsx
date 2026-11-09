import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { retrieveUser } from '../api/client'
import type { User } from '../api/types'

interface UsersContextValue {
  users: Record<number, User>
  getUser: (id: number) => Promise<User>
}

const UsersContext = createContext<UsersContextValue | null>(null)

export function UsersProvider({ children }: { children: ReactNode }) {
  const cache = useRef(new Map<number, User>())
  const inFlight = useRef(new Map<number, Promise<User>>())
  const [users, setUsers] = useState<Record<number, User>>({})

  const getUser = useCallback((id: number) => {
    const cachedUser = cache.current.get(id)
    if (cachedUser) {
      return Promise.resolve(cachedUser)
    }

    const pendingRequest = inFlight.current.get(id)
    if (pendingRequest) {
      return pendingRequest
    }

    const request = retrieveUser(id)
      .then((user) => {
        cache.current.set(id, user)
        inFlight.current.delete(id)
        setUsers((currentUsers) => ({ ...currentUsers, [id]: user }))
        return user
      })
      .catch((cause: unknown) => {
        inFlight.current.delete(id)
        throw cause
      })

    inFlight.current.set(id, request)
    return request
  }, [])

  const value = useMemo<UsersContextValue>(() => ({ users, getUser }), [getUser, users])

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers(): UsersContextValue {
  const context = useContext(UsersContext)

  if (!context) {
    throw new Error('useUsers doit être utilisé dans un UsersProvider.')
  }

  return context
}
