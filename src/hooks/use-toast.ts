/**
 * use-toast - toast notification hook
 * Provides a React hook for managing toast notifications throughout the app
 */

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1 // maximum number of toasts shown at once
const TOAST_REMOVE_DELAY = 1000000 // delay before removing toast from DOM

// enhanced toast type with additional properties
type ToasterToast = ToastProps & {
  id: string // unique identifier for each toast
  title?: React.ReactNode // toast title content
  description?: React.ReactNode // toast description content
  action?: ToastActionElement // optional action button
}

// action types for toast state management
const actionTypes = {
  ADD_TOAST: "ADD_TOAST", // add new toast
  UPDATE_TOAST: "UPDATE_TOAST", // update existing toast
  DISMISS_TOAST: "DISMISS_TOAST", // hide toast
  REMOVE_TOAST: "REMOVE_TOAST", // remove toast from state
} as const

let count = 0 // global counter for generating unique IDs

// generate unique ID for each toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER // increment counter, wrap at max safe integer
  return count.toString() // return as string
}

type ActionType = typeof actionTypes

// union type for all possible toast actions
type Action =
  | {
      type: ActionType["ADD_TOAST"] // adding a new toast
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"] // updating existing toast
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"] // dismissing toast (hide but keep in state)
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"] // removing toast from state completely
      toastId?: ToasterToast["id"]
    }

// toast state interface
interface State {
  toasts: ToasterToast[] // array of active toasts
}

// map to track timeout IDs for each toast
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// add toast to removal queue with delay
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return // already queued for removal
  }

  // schedule toast removal after delay
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId) // clean up timeout reference
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout) // store timeout reference
}

// reducer function to handle toast state changes
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT), // add new toast, keep only latest ones
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t // update matching toast
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // schedule toast removal (side effect kept here for simplicity)
      if (toastId) {
        addToRemoveQueue(toastId) // queue specific toast for removal
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id) // queue all toasts for removal
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // hide toast
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [], // clear all toasts
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId), // remove specific toast
      }
  }
}

// array of state listeners for cross-component updates
const listeners: Array<(state: State) => void> = []

// global state store for toast notifications
let memoryState: State = { toasts: [] }

// dispatch action to update toast state
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action) // update global state
  listeners.forEach((listener) => {
    listener(memoryState) // notify all listeners of state change
  })
}

// toast options type (without id since it's auto-generated)
type Toast = Omit<ToasterToast, "id">

// create a new toast notification
function toast({ ...props }: Toast) {
  const id = genId() // generate unique ID

  // function to update this specific toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  
  // function to dismiss this specific toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // add the toast to the state
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true, // show toast by default
      onOpenChange: (open) => {
        if (!open) dismiss() // dismiss when user closes
      },
    },
  })

  return {
    id: id,
    dismiss, // allow manual dismissal
    update, // allow toast updates
  }
}

// React hook to use toast notifications
function useToast() {
  const [state, setState] = React.useState<State>(memoryState) // local state synced with global

  React.useEffect(() => {
    listeners.push(setState) // subscribe to state updates
    return () => {
      const index = listeners.indexOf(setState) // find this listener
      if (index > -1) {
        listeners.splice(index, 1) // remove listener on cleanup
      }
    }
  }, [state])

  return {
    ...state, // spread current toast state
    toast, // function to create new toast
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // function to dismiss toast
  }
}

export { useToast, toast }
