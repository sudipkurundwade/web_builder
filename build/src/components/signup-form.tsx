import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/constants/routes"

interface SignupFormProps extends React.ComponentProps<"div"> {
  onSignInClick?: () => void;
}

export function SignupForm({
  className,
  onSignInClick,
  ...props
}: SignupFormProps) {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!name.trim()) {
      setError('Full name is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      // Calls POST /api/auth/signup → saves user in MongoDB
      await signup(name.trim(), email, password)
      setSuccess(true)

      // Redirect to login after short delay
      setTimeout(() => {
        navigate(ROUTES.LOGIN, { replace: true })
      }, 1500)
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message
      if (err?.response?.status === 409) {
        setError('An account with this email already exists. Please sign in.')
      } else if (msg) {
        setError(msg)
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Fill in your details to get started
                </p>
              </div>

              {/* Full Name */}
              <Field>
                <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="name"
                />
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </Field>

              {/* Password */}
              <Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="signup-confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="new-password"
                    />
                  </Field>
                </div>
              </Field>

              {/* Error message */}
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}

              {/* Success message */}
              {success && (
                <p className="text-sm font-medium text-green-600">
                  Account created! Redirecting to login…
                </p>
              )}

              <Field>
                <Button type="submit" disabled={loading || success} className="w-full">
                  {loading ? 'Creating Account…' : 'Create Account'}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSignInClick}
                  className="font-medium underline hover:text-primary"
                >
                  Sign in
                </button>
              </FieldDescription>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By creating an account, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
