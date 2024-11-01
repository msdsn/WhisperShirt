import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/utils'

const Register = () => {
  return (
    <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
  )
}

export default Register