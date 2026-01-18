export type LoginFormState = {
  email: string
  password: string
  showPassword: boolean
}

export type FeatureItem = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "success"
  | "destructive"
  | "link"

export type ButtonSize = "default" | "sm" | "lg" | "icon"
