type SignUpProps = {
  name: string,
  email: string,
  password: string
}

export async function signup({ email, name, password }: SignUpProps) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  })

  return response
}